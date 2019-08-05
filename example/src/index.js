import React  from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router-dom';
import { createHashHistory } from "history";
import Provider,{ Dynamic } from 'dva-react-hook';
import Home from './routes/home.js';
import './index.css';
const customHistory = createHashHistory();
const initState = {
  history: customHistory,
  name:'Lynn',
  apples:{
      state:'raw',
      count:4
  }
}
function App() {
  return (
    <Provider {...initState}>
        <Router history={customHistory}>
            <Route path="/" render={(props) => <Dynamic {...props} component={Home} models={() => [import('./model')]} />} />
        </Router>
    </Provider>
  );
}

ReactDOM.render(<App />, document.getElementById("root"))
