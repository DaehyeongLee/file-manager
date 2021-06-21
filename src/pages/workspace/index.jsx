import React from 'react';

import Header from './containers/Header';
import FileUpload from './containers/FileUpload';
import Chat from './containers/Chat';

const Workspace = (props) => (
	<div>
		<Header {...props}/>
		{props.page == "landing" &&
			<FileUpload />
		}
		{props.page == "chat" && 
			<Chat {...props}/>
		}
	</div>
);

export default Workspace;