import React from 'react';
import axios from 'axios';
import IoClient from "socket.io-client";

import style from './style.scss';
import { Button, Form, Label, Input, FormText, Row, Col} from 'reactstrap';

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
		
		this.setMessageList(); //DB에 저장된 메시지 전체를 가져오기
		this.onScrollBottom(); //스크롤 최하단으로
		
		//현재 로그인한 유저의 이름 가져오기
		axios.get('/api/account/id').then(({ data }) => {
			//console.log("userId", data)
			this.setState({
				userFrom: data
			});
		});
		//Socket Io 정의
		socket.on('receive message', (item) => {
			
			//서버 Socket으로부터 온 메시지를 state에 저장
			this.setState({messageList: [...this.state.messageList, { message: item.message, userFrom: item.userFrom, userTo: item.userTo, isWhisper: item.isWhisper}]}); 
			
			//console.log("All receive - Client")
			
			//서버 Socket으로부터 온 메시지를 DB에 저장
			// axios.post('/api/chat/newMessage', {
			// 	message: item.message,
			// 	userFrom: item.userFrom,
			// 	userTo: item.userTo,	
			// 	isWhisper: item.isWhisper
				
			// }).then((response)=> {
				
			// 	if(response.data) {
			// 		//DB에 새로운 입력 메시지가 저장됐다면, 메시지를 기존 messageList에 병합
			// 		this.setMessageList(); //DB에 저장된 메시지 전체를 가져오기
			// 	} else {
			// 		alert('메시지를 데이터베이스에 저장하는 것에 실패했습니다.')
			// 	}
			// })
			
			
    	})
		//Socket Error
		socket.on("connect_error", (err) => {
  			//console.log(`connect_error due to ${err.message}`);
			socket.disconnect(); //서버와 연결 끊길시 disconnect
		});
		
	}
	
	//메시지 submit시
	onFormSubmitMessage = e => {
		
		e.preventDefault();
		this.setState({message: ""}) //메시지 전송시 Input field안 메시지 초기화
		this.setState(
			{messageList: [...this.state.messageList, { userFrom: this.state.userFrom, message: this.state.message, userTo: this.state.userTo, isWhisper: this.state.userTo == "All" ? false : true}]}
		); //내가 보낸 메시지를 화면에 표시하게끔 함
		
		//보낸 메시지를 DB에 저장
		axios.post('/api/chat/newMessage', {
				message: this.state.message, //메시지 내용
				userFrom: this.state.userFrom, //메시지 보낸 사람
				userTo: this.state.userTo, //메시지 받는 대상
				isWhisper: this.state.userTo == "All" ? false : true //귓속말 여부
				
			}).then((response)=> {
				
				if(response.data) {
					console.log("Message save?", response.data)
				} else {
					alert('메시지를 데이터베이스에 저장하는 것에 실패했습니다.')
				}
			})
		
		//Socket Io event 발생
    	socket.emit('send message', { id: socket.id, userTo: this.state.userTo, userFrom: this.state.userFrom, message: this.state.message });
		
		this.onScrollBottom(); //스크롤 최하단으로
	}
	
	//전체 메시지 불러오는 함수
	setMessageList = () => {
		axios.get('/api/chat/getMessages').then((response)=> {
				//console.log("getMessages func - Client")
				
				if(response.data.success) {
					//console.log("Message save?", response.data);
					const messages = response.data.messages;
					
					//DB로부터 불러온 전체 메시지를 state에 저장
					this.setState({messageList: response.data.messages});				
				} else {
					alert('저장된 메시지를 불러오는 것에 실패했습니다.')
				}
			})
	}
	
	//메시지 박스의 스크롤을 최하단으로 한다.
	onScrollBottom = () => {
		if (this.state.messageList.length > 8) {
			this.messageEnd.scrollIntoView({ behavior: 'smooth'}); //첫 로딩시 스크롤이 최하단으로 내려가도록
		}
	}
	
	//유저 이름 클릭시 귓속말 상대를 클릭된 이름으로 설정
	onClickUserTo = value => {		
		if (value !== this.state.userFrom)
			this.setState({userTo: value})
		else 
			this.setState({userTo: "All"})
	}
	
	//메시지를 전체 삭제한다
	onClickRemove = () => {
		axios.get('/api/chat/removeMessages').then((response)=> {
				
				if(response.data.success) {
					//console.log("Remove data", response.data)
					//this.setState({messageList: []});	
					this.setMessageList(); //삭제후 리스트를 다시 불러온다. 
				} else {
					alert('전체 메시지를 삭제하는 것에 실패했습니다.')
				}
			})
	}
	
	renderChatList = (item, index) => {
		{/*전체 Message List중 userTo가 All이거나 현재 userFrom이랑 같은 경우의 아이템만 render => DB에서 불러온 데이터에서 다른유저대상 귓속말 필터 위함*/}	
		if(item.userTo == "All" || item.userFrom == this.state.userFrom || item.userTo == this.state.userFrom) {
			
			return	<div key={index}>
				{/*유저 이름 표시: 귓속말일 경우 귓속말임을 표시해준다.
				귓속말일 경우: {보낸사람}님의 귓속말
				전체 채팅일 경우: {보낸사람} 단, 보낸사람이 자신일 경우는 Me로 표시
				*/}
				<p onClick={(value) => this.onClickUserTo(item.userFrom)} 
					className={style.ChatPage__chatList__username}>
					{item.userFrom == this.state.userFrom ? "Me" : item.isWhisper ? `${item.userFrom}님의 귓속말` : item.userFrom}
				</p>
				{/*내가 보낸 메시지와 받은 메시지 배경색 다르게 처리*/}
				{/*메시지 개수 늘어나 스크롤 생길시 해당 포지션으로 스크롤 이동*/}
				<p 
					className={item.userFrom == this.state.userFrom ? style.ChatPage__chatList__mytext : style.ChatPage__chatList__usertext}
					ref={(ref) => {this.messageEnd = ref;} } 
					>{item.message}</p>
			</div>
			
		}
	}

	render() {
		
		return (
			<div>
			<h4 className={style.Title}>Chat</h4>
			<Row>
				<Col>
					<FormText className={style.subTitle} color="muted">
						귓속말을 보내고 싶은 상대의 아이디를 클릭하면 귓속말을 보낼 수 있습니다.<br />
						전체 메시지로 바꾸고 싶으시다면 입력창 왼쪽 아이디를 클릭하세요.
					</FormText>
				</Col>	
				<Col>
					<Button onClick={() => this.onClickRemove()}>전체삭제(테스트용)</Button>
				</Col>
			</Row>
			
			<div className = {style.ChatPage}>
				<div className={style.ChatPage__chatList}>
					{/*전체 채팅리스트 배열로부터 채팅 목록을 화면에 표시*/}
					{this.state.messageList.map((item, index) => 
						this.renderChatList(item, index)
						
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