import "./index.css";
import { useAuth0 } from "@auth0/auth0-react";

function Login() {
  const { loginWithRedirect } = useAuth0();
  return (
    <>
      <div className="login">
        <div className="login__decathlon-logo">
          <img src="https://decathlon-source.eu/general-images/new_logo_decathlon.png" />
        </div>
        <img />
        <div className="login__content">
          <h1 className="login__title">Rental Booking</h1>

          <button
            style={{ textTransform: "uppercase" }}
            onClick={() => loginWithRedirect()}
          >
            login / signup
          </button>
          <span style={{ color: "#eee", display: "block", paddingTop: "10px" }}>
            Decathlon Austria
          </span>
        </div>
      </div>
    </>
  );
}

export default Login;
