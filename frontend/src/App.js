import TextEditor from "./TextEditor"
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom"

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/">
          <TextEditor />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
