// Requiring our models
const db = require("../models"), bcrypt = require ("bcrypt"), Sequelize = require('sequelize'), Op = Sequelize.Op;
var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyD3M0WR0Z9a1lnWBnz6Fx3F-iaBTDYCJjo',
    Promise: Promise
  });

module.exports = (app, passport)=>{
	app.post('/api/login', (req, res)=>{
        db.User.findOne({where: {user_login : req.body.user_login}
        }).then((user)=>{
            bcrypt.compare(req.body.user_passwd, user.user_passwd, (err, loginSuccess)=>{
               if (loginSuccess){ 
                   res.json(user)
                }
               else{
                    res.json(false)
               }
        
            })
        });
        
    });

	app.post('/api/signup', (req, res)=>{
		db.User.findOne({where: {user_login : req.body.user_login}
        }).then((user)=>{
        	if (user) res.json(false);
        	else {
		        const {user_login, user_passwd} = req.body;
		        console.log(req.body);
		        bcrypt.hash(user_passwd, 10, (err, hash)=>{
		            console.log(hash);
		            db.User.create({user_login: user_login, user_passwd: hash})
		            .then(newUser => {
		                res.json(newUser);
		            })  
		        })
		    }
	    });
    });

    app.post('/api/newuser', (req, res)=>{
        let geoLocat= [];
        db.User.findOne({where: {id: req.body.userId}
        })
        .then(dbuser=>{
            googleMapsClient.geocode({address: req.body.addr1 +', '+ req.body.city + ', ' + req.body.state
                }).asPromise().then((response)=>{
                        console.log(response.json.results[0].geometry.location);
                        geocode = response.json.results[0].geometry.location;
                        geoLocat = [geocode.lat, geocode.lng]
                        console.log('\n\n\n\n\n\n\n\n\n\n\n');
                        console.log(geoLocat);
                        
                    })
                    .catch((err)=>{
                        console.log(err)
                    })
                    .then(()=>{
                        dbuser.update({
                            fname: req.body.fname,
                            lname: req.body.lname,
                            addr1: req.body.addr1,
                            city: req.body.city,
                            state: req.body.state,
                            zip: req.body.zip,
                            geoLocat: geoLocat,
                            image: req.body.image,
                            owner_profile: req.body.owner_profile
                        })  
                    })
                    .then((updatedUser) =>{
                        db.Dog.create({
                            owner_id: updatedUser.id,
                            dog_name: req.body.dog_name,
                            breed: req.body.breed,
                            sex: req.body.sex,
                            age: req.body.age,
                            demeanor: req.body.demeanor,
                            size: req.body.size
                        })
                    })    
                    .then(() => {
                        res.json(updatedUser)
                    })
                
        })            
    });

	app.get('/api/profile/:id', (req, res)=>{
		db.User.findOne({ where: { id: req.params.id } })
			.then(dbUser => { db.Dog.findOne({ where: { owner_id: dbUser.id } }) 
				.then(dbDog => { res.json({user: dbUser, dog: dbDog}); 
			});
		});
	});

	app.post('/api/updateuser', (req, res)=> {
		db.User.findOne({ where: { id: req.body.userId } })
			.then(dbUser => { dbUser.update({ [req.body.val]: req.body.data })
				.then(user => { res.json(user);
			});
		});
	});

	app.post('/api/updatedog', (req, res)=> {
		db.Dog.findOne({ where: { owner_id: req.body.userId } })
			.then(dbDog => { dbDog.update({ [req.body.val]: req.body.data })
				.then(dog => { res.json(dog);
			});
		});
	});

	app.get('/api/matches/:id', (req, res)=>{
       db.User.findOne({
			where: {
			   id: req.params.id
			}
			}).then(user => {db.User.findAll({
			   where: {
			       city: user.city,
			       id: {
			           [Op.ne]: req.params.id
			       }
			   },
			   attributes: ['id']
			}).then(ids => {res.json(ids);
       		});
        });
    });

	app.post('/api/matchlist', (req, res)=> {
		db.MatchList.findOne({ where: { user_id: req.body.userId, match: req.body.matchId } })
		.then(alreadyMatched => {
			if (!alreadyMatched) {
				db.MatchList.create({ 
					user_id: req.body.userId,
					match: req.body.matchId
				})
					.then(() => { db.MatchList.findOne({ where: { user_id: req.body.matchId, match: req.body.userId } })
						.then(match => { res.json(match ? true : false);
					});
				});
			}
			else {
				db.MatchList.findOne({ where: { user_id: req.body.matchId, match: req.body.userId } })
						.then(match => { res.json(match ? true : false);
					});
			}
		});
	});

};