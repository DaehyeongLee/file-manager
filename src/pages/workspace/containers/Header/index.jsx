import React from 'react';
import { DropdownToggle, UncontrolledDropdown, DropdownMenu, DropdownItem } from 'reactstrap';
import axios from 'axios';

import style from './style.scss';

class Header extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userId: ''
		};
	}

	componentDidMount() {
		axios.get('/api/account/id').then(({ data }) => {
			this.setState({
				userId: data
			});
		});
	}

	signOut = () => {
		window.location.href = '/api/account/signout';
	};

	onPage = () => {
		//현재 페이지가 chat일 경우 메뉴에는 Landing이 보이도록 함
		if (this.props.page == "chat")
			window.location.href = '/workspace';
		//현재 페이지가 Landing일 경우 메뉴에는 Chat이 보이도록 함
		else if (this.props.page == "landing")
			window.location.href = '/chat';
	};

	render() {
		const { userId } = this.state;
		return (
			<div className={style.Header}>
				<UncontrolledDropdown>
					<DropdownToggle caret tag="a" className={style.Header__dropdown}>
						{userId}
					</DropdownToggle>
					<DropdownMenu right>
						<DropdownItem onClick={this.onPage}>{this.props.page == "landing" ? "Chat" : "Landing"}</DropdownItem>
						<DropdownItem onClick={this.signOut}>로그아웃</DropdownItem>
					</DropdownMenu>
				</UncontrolledDropdown>
			</div>
		);
	}
}

export default Header;