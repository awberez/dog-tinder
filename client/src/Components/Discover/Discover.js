import React, { Component } from 'react';
import API from "../../utils/API";
import DiscoverCard from "../DiscoverCard";
import Header from "../Header";
import geolib from "geolib";
import './Discover.css';

let userCoords = [], userObj;

class Discover extends Component {
    constructor (props) {
        super(props);
        this.state = { 
        	radius: 1 
        }
    }

	componentDidMount() {
	  	userObj = {userId: this.props.userId}
	  	if (!userObj.userId) this.props.history.push('/');
	  	API.getUser(userObj)
	      .then(res => {
	      	if (!res.data.dog) {
	      	    this.props.finishForm();
	      	    this.props.history.push('/');
	        }
	        else {
	        	document.body.classList.add("logged-in-background");
	        	userCoords = res.data.user.geoLocat.coordinates;
	        	this.getMatches(1);
	        }
	      })
	      .catch(err => console.log(err));
	}

	componentWillUnmount() {
	    document.body.classList.remove("logged-in-background");
	}

	getMatches = radius => {
    	API.findMatches(userObj)
	      .then(res => {
	      	this.setState({ matches: res.data, userMatches: [], dogMatches: [] }, ()=>{
	      		console.log(res);
	      		this.state.matches.forEach(id => {
	      			console.log(id);
	      			let userObj = {userId: id.id};
	      			API.getUser(userObj)
				      .then(res => {
				      	if (res.data.dog && this.withinDist(radius, res.data.user.geoLocat.coordinates)) {
				      	    let userMatches = this.state.userMatches, dogMatches = this.state.dogMatches;
				      	    userMatches.push(res.data.user);
				      	    dogMatches.push(res.data.dog);
				      	    this.setState({userMatches, dogMatches});
				        }
				      })
				      .catch(err => console.log(err));
	      		});
	      	});
	      })
	      .catch(err => console.log(err));
	}

	withinDist = (radius, matchCoords) => {
		console.log("getting distance");
		this.setState({radius});
		let dist = geolib.getDistance(
		    {latitude: userCoords[0], longitude: userCoords[1]},
		    {latitude: matchCoords[0], longitude: matchCoords[1]}
		);
		return dist <= radius * 1610;
	}

	radiusSlider = event => {
		this.setState({ radius: event.target.value });
	}

	radiusSubmit = event => {
		event.preventDefault();
		this.getMatches(this.state.radius);
	}

	profileButton = () => {
	  	this.props.history.push('/profile')
	}

    render () {
        return (
            <div className='bg-color'>
            	<br/>
            	<Header><h3 className='title'>Discover</h3></Header>
            	<button className="find-but flex-center" onClick={this.profileButton}>Edit My Profile!</button>
            	<div className="match-range">
	            	<p>Choose a Match Range (miles):</p>
	            	<form onSubmit={this.radiusSubmit}>
						<input type="range" min="1" max="25" value={this.state.radius} onChange={this.radiusSlider}/>
						<input className="range-box" type="number" min="1" max="25" value={this.state.radius} onChange={this.radiusSlider} />
						<button className="search-but" type="submit">Search!</button>
					</form>
				</div>
            	<div className="wrapper">
	                {this.state && this.state.matches && 
	                	this.state.userMatches.map(user => (
			                <DiscoverCard
			                	key={user.id}
			                	user={user}
			                	userId={this.props.userId}
			                	dog={this.state.dogMatches.find(dog => dog.owner_id === user.id)}
			                />
	              		))
	                }
	            </div>
            </div>
        )
    }
}

export default Discover;