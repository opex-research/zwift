import { useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import {
  loginWithMetaMask,
  getAccountBalance,
} from "../services/MetaMaskService";

function LoginPage() {
  const navigate = useNavigate();
  const { setAccount, setBalance, setLogged, logged } = useAccount();

  const handleLogin = async () => {
    const account = await loginWithMetaMask();
    if (account) {
      setLogged(true);
      setAccount(account);

      const balance = await getAccountBalance(account);
      if (balance) setBalance(balance);

      navigate("/dashboard");
    }
  };

  return (
    <div className="Login">
      {!logged ? (
        <>
          <h1>Log in with Metamask wallet</h1>
          <button onClick={handleLogin}>Log In</button>
        </>
      ) : (
        <h1>Logged in</h1>
      )}
    </div>
  );
}

export default LoginPage;
