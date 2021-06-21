import React from 'react';
import axios from 'axios';
import IoClient from "socket.io-client";

import style from './style.scss';
import { Button, Form, Label, Input} from 'reactstrap';

const socket = IoClient('mission-apm5018-ppskt.run.goorm.io');

class Chat extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			userFrom: "", //메시지 보내는 사람 이름 (현재 로그인한 아이디)
			userTo: "All", //메시지 받는 대상
			message: "", //입력한 메시지
			messageList: [] //전체 메시지 저장되는 배열
		};
	}

	componentDidMount() {
		//현재 로그인한 유저의 이름 가져오기
		axios.get('/api/account/id').then(({ data }) => {
			console.log("userId", data)
			this.setState({
				userFrom: data
			});
		});
		//Socket Io 정의
		socket.on('receive message', (item) => {
			//상대방이 보낸 메시지를 받아와 기존 messageList에 병합
			this.setState({messageList: [...this.state.messageList, { userFrom: item.userFrom, message: item.message }]});
    	})
	}
	
	onFormSubmitMessage = e => {
		e.preventDefault();
		//Socket Io event 발생
		this.setState({message: ""}) //메시지 전송시 Input field안 메시지 초기화
		this.setState({messageList: [...this.state.messageList, { userFrom: "Me", message: this.state.message }]}); //내가 보낸 메시지를 화면에 표시하게끔 함
    	socket.emit('send message', { id: socket.id, userTo: this.state.userTo, userFrom: this.state.userFrom, message: this.state.message });
	}
	
	onClickUserTo = value => {
		
		if (value !== "Me")
			this.setState({userTo: value})
		else 
			this.setState({userTo: "All"})
		
	}

	render() {
		
		return (
			<div>
			<h4 className={style.Title}>Chat</h4>
			<div className = {style.ChatPage}>
				<div className={style.ChatPage__chatList}>
					{/*전체 채팅리스트 배열로부터 채팅 목록을 화면에 표시*/}
					{this.state.messageList.map((item, index) =>
						<div key={index}>
							<p onClick={(value) => this.onClickUserTo(item.userFrom)} className={style.ChatPage__chatList__username}>{item.userFrom}</p>
							{/*내가 보낸 메시지, 받은 메시지에 대해 배경색 다르게 처리*/}
							<p className={item.userFrom == "Me" ? style.ChatPage__chatList__mytext : style.ChatPage__chatList__usertext}>{item.message}</p>
						</div>
					)} 
      			</div>
      			<Form className={style.ChatPage__chatForm}
        			onSubmit={this.onFormSubmitMessage}>
        			<div className={style.ChatPage__chatForm__chatInput}>
						{/*메시지 보낼 대상 표시 Label*/}
						<Label className={style.ChatPage__chatForm__chatInput__userTo}>{this.state.userTo}</Label>
          				{/*메시지 입력되는 Input*/}
          				<Input
            			type="text"
            			onChange={(e) => this.setState({message: e.target.value})}
            			value={this.state.message}
            			placeholder="Enter message"
          				/>
        			</div>
					{/*메시지 전송 버튼*/}
        			<Button type="submit">Send</Button>
      			</Form>
			</div>
			</div>
		);
	}
}

export default Chat;