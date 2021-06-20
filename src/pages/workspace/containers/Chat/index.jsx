import React from 'react';
import axios from 'axios';

import style from './style.scss';
import { Button, Form, FormGroup, FormText, Label, Input, Container, Row, Col} from 'reactstrap';

class Chat extends React.Component {
	constructor(props) {
		console.log("chat props:", props)
		super(props);
		this.state = {
			message: "" //입력한 메시지
		};
	}

	componentDidMount() {
		// {messageList.map((item: Message, i: number) =>
		// 				<div key={i} className="message">
		// 					<p className="username">{item.name.toUpperCase()}</p>
		// 					<p className="message-text">{item.message}</p>
		// 				</div>
		// )} 
	}

	render() {
		
		return (
			<div>
			<h4 className={style.Title}>Chat</h4>
			<div className = {style.ChatPage}>
				<div className={style.ChatPage__chatList}>
					Message List
      			</div>
      			<Form className={style.ChatPage__chatForm}
        			onSubmit>
        			<div className={style.ChatPage__chatForm__chatInput}>
          				
          				<Input
            			type="text"
            			onChange={(e) => this.setState({message: e.target.value})}
            			value={this.state.message}
            			placeholder="Enter message"
          				/>
        			</div>
        			<Button type="submit">Send</Button>
      			</Form>
			</div>
			</div>
		);
	}
}

export default Chat;