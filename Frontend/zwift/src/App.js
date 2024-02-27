import logo from './logo.svg';
import './App.css';
import CounterComponent from './Components/counter'; // Ensure the path is correct

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Our Setup Framework</h1>
        <CounterComponent />
      </header>
    </div>
  );
}

export default App;
