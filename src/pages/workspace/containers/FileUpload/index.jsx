import React, {useRef } from 'react';
import axios from 'axios';

//import CenterLayout from 'components/CenterLayout';
import style from './style.scss';
import { Button, Form, FormGroup, FormText, Label, Input, Container, Row, Col} from 'reactstrap';


class FileUpload extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = { 
			file : {}, //zip or tar 파일의 전체 정보
			filePath: "", //zip or tar 파일 경로
			fileName: "", //zip or tar 파일의 이름
			fileList: [], //압축 해제된 파일의 List
			toggleTextArea: false, //Textarea visible toggle
			clickedItem: "", //파일 List중 클릭된 파일의 Path
			clickedItemContent: "" //파일 List중 클릭된 파일의 content
		}

	}
	
	//Textarea밑 저장 버튼 클릭시 호출
	onFormSubmitTextarea = e => {
		e.preventDefault() // Stop form submit
		
		//변경한 파일 내용 저장
		axios.post('/api/files/saveDetail', {clickedItemContent: this.state.clickedItemContent, clickedItem: this.state.clickedItem}).then((response)=> {
			if (response.data.success) { 
				alert ("파일 내용을 수정하는 것에 성공했습니다.")
				
				//파일 수정 성공 후 Textarea 안보이게 처리
				this.setState({toggleTextArea: false})
			} else {				
				alert ("파일 내용을 수정하는 것에 실패했습니다.")
			}
		})
	}	

	//새로운 파일 업로드 시 호출
	onChangeFile = e => {
		
		let formData = new FormData(); //업로드될 파일을 저장할 FormData
		let uploadedFile = e.target.files[0];
		
		//console.log("fileSize", uploadedFile.size);
		
		formData.append('file', uploadedFile);
		
		this.setState({toggleTextArea: false}) //새로운 파일 업로드 시 Textarea 열려있다면 close
		
		
		//이전 업로드됐던 파일들을 모두 삭제
		axios.post('/api/files/delete').then((response)=> {
			
			//삭제 성공
			if(response.data.success) {
				
				//삭제 성공 후 업로드 파일 저장, 업로드된 파일의 압축 해제 수행
				axios.post('/api/files/file', formData).then((response) => {
					if (response.data.success) {
						
						//업로드된 zip or tar 파일에 대한 정보 state에 저장
						this.setState({
							file : uploadedFile,
							filePath : response.data.filePath,
							fileName : response.data.fileName
						});
						
						//파일이 올바르게 선택되었을때 unzip 실행
						if (response.data.filePath.length > 0)
							axios.post('/api/files/unzip', {filePath: this.state.filePath}).then((response)=> {
								if(response.data.success) {
									//console.log("response.data.fileInfo", response.data.fileInfo);
									this.setState({fileList: response.data.fileInfo})
								} else {
									alert('압축을 해제하는데 실패했습니다.')
								}
							})
						
					} else {
						alert('업로드하는데 실패했습니다.');
						//console.log(response.data.err);
					}
				});				
			} else {
				alert('기존 업로드된 파일의 삭제를 실패했습니다.')
			}
			
		})			
		
	}
	
	//Textarea content 수정시 호출
	onChangeTestarea = e => {
		this.setState({ clickedItemContent: e.currentTarget.value });
	}
	
	//압축해제된 아이템중 하나 클릭시 호출
	onClickItem = value => {
		
		//클릭한 아이템 경로/이름 state에 저장
		this.setState({clickedItem: value});
		
		//파일안 내용 불러오기
		axios.post('/api/files/detail', {clickedItem: value}).then((response)=> {
			
			if(response.data.success) {
				//Click시 Textarea 보이도록 함. Textarea에는 선택된 파일 내용이 value로 들어가있음
				this.setState({toggleTextArea: true, clickedItemContent: response.data.content})
			} else {
				alert('선택된 파일 내용을 읽어오는 것에 실패했습니다.')
			}
			
		})		
		
	}
	
	render() {
		
		//파일 리스트 표시 map 함수
		const renderFileList = this.state.fileList.map((item, index) => {
			
			//파일 이름이 존재할 때만 리스트에 표시
			if(item.filePath.length > 0) {
				//Type: File - 선택 가능하게 함
				if (item.fileType == 'File')
					return (<li 
								className = {style.FileUploadPage__leftSide__li_file}								
								onClick={(value) => this.onClickItem(item.filePath)} 
								key={index}
								>
							{item.filePath}
						</li>)
				else //Type: Directory - 선택 불가
					return (<li key={index}>{item.filePath}</li>)
			}
			
		});
		
		
		return (
			<div className = {style.FileUploadPage}>
				<h4>File Upload</h4>
				<Row>
					<Col>
						{/*Left Side: 파일 업로드, 업로드된 zip, tar 압축 해제 후 파일 리스트 표시 */}
						<div className = {style.FileUploadPage__leftSide}>
							<Form>
								<FormGroup>
									<Label for="file">File</Label>
									<Input 
										type="file" 
										id="file" 
										accept=".zip, .tar" //확장자 zip, tar로 제한
										onChange={this.onChangeFile}/>
									<FormText color="muted">
										파일의 최대 허용 가능 크기는 xxx 입니다.<br />
										채팅 기능 사용을 원하시면 오른쪽 상단 Dropdown을 통해 접근하세요.
									</FormText>
								</FormGroup>
								
							</Form>	
							<div className = {style.FileUploadPage__leftSide__fileList}>
								<ul>
									{renderFileList}
								</ul>
							</div>		
							</div>
					</Col>
					<Col>
						{/*Right Side: 파일 리스트중 하나 선택시 파일내용 수정field 표시 */}
						<div className = {style.FileUploadPage__rightSide}>
							{/* 파일중 하나 선택시 toggle->true 되고 textarea 표시*/}
							{this.state.toggleTextArea &&
								<Form onSubmit={this.onFormSubmitTextarea}>
									<FormGroup>
										<Label for="textarea">Text Area</Label>
										<Input 
											className={style.FileUploadPage__rightSide__textarea} 
											type="textarea" 
											id="textarea" 
											value={this.state.clickedItemContent}
											onChange={this.onChangeTestarea}
											/>
									</FormGroup>
									<FormGroup>
										<Button type="submit">Save</Button>
									</FormGroup>
								</Form>										
							}
						</div>
					</Col>
				</Row>		

			</div>
		);
	}
}

export default FileUpload;