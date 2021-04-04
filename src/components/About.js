import React from "react";

export default function About() {
  return <>
        <div className="hero is-primary">
            <div className="hero-body container">
            <h4 className="title">About</h4>
            </div>
        </div>
        <div className=" column is-half">
            <div className="box">
                <div className="media">
                    <div className="media-left">
                        <figure className="image is-64x64">
                        <img
                            src="https://pbs.twimg.com/profile_images/1211262497358929920/ux9BJNqh_400x400.jpg"
                            alt="Rhevy"
                        />
                        </figure>
                    </div>
                    <div className="media-content">
                        <b style={{ textTransform: "capitalize" }}>
                        Rhevy Lis Alfianny
                        </b>
                        <div>TI-3F</div>
                        <div>1841720100</div>
                        
                    </div>
                </div>
            </div>
        </div>
  </>
}
