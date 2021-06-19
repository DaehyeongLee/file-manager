import React from 'react';

import Header from './containers/Header';
import FileUpload from './containers/FileUpload';
import Chat from './containers/Chat';

const Workspace = () => (
	<div>
		<Header />
		<FileUpload />
		<Chat />
	</div>
);

export default Workspace;