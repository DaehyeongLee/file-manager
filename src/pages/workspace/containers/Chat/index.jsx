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
			this.setState({messageList: [...this.state.messageList, { userFrom: item.userFrom, message: item.message, isWhisper: item.isWhisper}]});
    	})
		//Socket Error
		socket.on("connect_error", (err) => {
  			console.log(`connect_error due to ${err.message}`);
			socket.disconnect(); //서버와 연결 끊길시 disconnect
		});
		
		this.onScrollBottom(); //스크롤 최하단으로
		
	}
	
	//메시지 submit시
	onFormSubmitMessage = e => {
		
		e.preventDefault();
		//Socket Io event 발생
		this.setState({message: ""}) //메시지 전송시 Input field안 메시지 초기화
		this.setState({messageList: [...this.state.messageList, { userFrom: "Me", message: this.state.message }]}); //내가 보낸 메시지를 화면에 표시하게끔 함
    	socket.emit('send message', { id: socket.id, userTo: this.state.userTo, userFrom: this.state.userFrom, message: this.state.message });
		
		this.onScrollBottom(); //스크롤 최하단으로
	}
	
	//메시지 박스의 스크롤을 최하단으로 한다.
	onScrollBottom = () => {
		if (this.state.messageList.length > 8) {
			this.messageEnd.scrollIntoView({ behavior: 'smooth'}); //첫 로딩시 스크롤이 최하단으로 내려가도록
		}
	}
	
	//유저 이름 클릭시 귓속말 상대를 클릭된 이름으로 설정
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
							{/*유저 이름 표시: 귓속말일 경우 귓속말임을 표시해준다.
							귓속말일 경우: {보낸사람}님의 귓속말
							전체 채팅일 경우: {보낸사람}
							*/}
							<p onClick={(value) => this.onClickUserTo(item.userFrom)} 
								className={style.ChatPage__chatList__username}>
								{item.isWhisper ? `${item.userFrom}님의 귓속말` : item.userFrom}
													
							</p>
							{/*내가 보낸 메시지와 받은 메시지 배경색 다르게 처리*/}
							{/*메시지 개수 늘어나 스크롤 생길시 해당 포지션으로 스크롤 이동*/}
							<p 
								className={item.userFrom == "Me" ? style.ChatPage__chatList__mytext : style.ChatPage__chatList__usertext}
								ref={(ref) => {this.messageEnd = ref;} } 
								>{item.message}</p>
						</div>
					)} 
      			</div>
      			<Form className={style.ChatPage__chatForm}
        			onSubmit={this.onFormSubmitMessage}>
        			<div className={style.ChatPage__chatForm__chatInput}>
						{/*메시지 보낼 대상 표시 Label*/}
						{/*Label 클릭시 메시지 받는 대상을 전체로 바꾼다*/}
						<Label 
							className={style.ChatPage__chatForm__chatInput__userTo}
							onClick={() => this.setState({userTo: "All"})} 
						>{this.state.userTo}</Label>
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