import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Workspace from 'pages/workspace';

const App = props => (
	<Switch>
		<Route exact path={['/', '/workspace']} render={() => <Workspace {...props} page = "landing"/>} />
		<Route exact path={['/chat']} render={() => <Workspace {...props} page = "chat"/>} />
	</Switch>
);
export default App;