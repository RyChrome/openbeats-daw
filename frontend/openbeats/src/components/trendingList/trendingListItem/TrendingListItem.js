import axios from "axios";
import { useEffect, useState } from "react";
import { url } from "../../../utils/constants";
import classes from "./TrendingListItem.module.css";
import ReactHashtag from "react-hashtag";
import LikeButton from "../../likeButton/LikeButton";
import profileImg from "../../profileIcon.png";
import { useHistory } from "react-router";

const TrendingListItem = ({ details }) => {
  const [author, setAuthor] = useState();
  let token = localStorage.getItem("auth-token");
  const history =  useHistory();

  useEffect(() => {
    getAuthorDetails();
  }, []);

  const description =
    details.description && details.description.length > 50
      ? details.description.slice(0, 50) + "..."
      : details.description;

  const getAuthorDetails = async () => {
    const res = await axios.get(url + "/getAuthorDetails/" + details.userId, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        Authorization: "Bearer " + token,
      },
    });
    setAuthor(res.data);
  };

  const goToProfile = () => {
    history.push("/profile/" + author?.username);
  };

  return (
    <div className="mb-5">
      {/* <div style={{ display: "flex", alignItems: "center", display: "flex", flexDirection: "row", flexWrap: "wrap" }} onClick={goToProfile}> */}
      <div style={{ display: "flex", alignItems: "center"}} onClick={goToProfile}>
        <img
          alt="Harry"
          src={author?.profilePictureFileName || profileImg}
          className={classes.profileIcon}
        />
        <span className={classes.author}>
          <strong
            className={classes.username}
          >{`${author?.firstName} ${author?.lastName}`}</strong>
            {/* <div style={{ marginTop: "5px" }}>
              <a className="ml-2" style={{ fontSize: "13px" }}>@{author?.username}</a>
              <button */}
              <a className="ml-2">@{author?.username}</a>
              <br/>
              <small className={classes.description}>
                <ReactHashtag>{description}</ReactHashtag>
              </small>
              <br />

          </span>
          <button
              style={{
                marginLeft: "auto",
                color: "gray",
              }}
              >
              <LikeButton details={details} token={token} />
              </button>
            {/* </div>
          </span>
          <br />
          <div>
          <small className={classes.description}>
            <ReactHashtag>{description}</ReactHashtag>
          </small></div>
          <br />

        <div className={classes.borderBottom}></div> */}
      </div>
      <div className={classes.borderBottom}></div>
    </div>
  );
};

export default TrendingListItem;
