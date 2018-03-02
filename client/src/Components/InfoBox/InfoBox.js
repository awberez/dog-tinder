import React from "react";
import "./InfoBox.css";

const InfoBox = props => (    
 	<div className="profile">
 		<span><b>{props.title}:</b></span>
 		{!props.edit && props.data
	 	  ? <div >
				<p>{props.data}</p>
				<button onClick={()=>{props.button(true)}}>
					Edit
				</button>
	        </div>
		  : <form onSubmit={props.handleSubmit}>
				{props.type === "radio" && props.title === "Sex"
					? 	<div onChange={props.handleChange}>
							<input type="radio" name="gender" value="Male" /> Male<br></br>
			  				<input type="radio" name="gender" value="Female" /> Female<br></br>
						</div>
					: 	props.type === "radio" && props.title === "Size"
						? 	<div onChange={props.handleChange}>
								<input type="radio" name="size" value="Small" /> Small<br></br>
				  				<input type="radio" name="size" value="Medium" /> Medium<br></br>
				  				<input type="radio" name="size" value="Large" /> Large<br></br>
				  				<input type="radio" name="size" value="Extra Large" /> Extra Large<br></br>
							</div>
							:	props.type === "textarea"
								?	<textarea className="profileText" value={props.newData} onChange={props.handleChange} />
								:   <input type={props.type} className="profileText" value={props.newData} onChange={props.handleChange} />
				}
				<input type="submit" value="Save" />
				<input type='button' value="Cancel" onClick={()=>{props.button(false)}} />
			</form>
		}
	</div>
);

export default InfoBox;