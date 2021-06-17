import React from 'react';
import axios from 'axios';

//import CenterLayout from 'components/CenterLayout';
import style from './style.scss';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';



class FileUpload extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = { 
			file : {},
			filePath: "",
			fileName: "",
			fileList: [],
			toggleTextArea: false,
			clickedItem: ""
		}
		
		this.onFormSubmit = this.onFormSubmit.bind(this)
		this.onChange = this.onChange.bind(this)
		//this.fileUpload = this.fileUpload.bind(this)
	}
	
	onFormSubmit(e){
		e.preventDefault() // Stop form submit
		//this.fileUpload(this.state.file).then((response)=>{
		//	console.log(response.data);
		//})
	}
	
	onChange(e) {
		console.log("e.target.files", e.target.files)
		
		let formData = new FormData();
		let uploadedFile = e.target.files;

		const config = {
			header: { 'content-type': 'multipart/form-data' },
		};
		formData.append('file', uploadedFile[0]);
		
		axios.post('/api/files/file', formData, config).then((response) => {
			if (response.data.success) {
				
				this.setState({
					file : uploadedFile[0],
					filePath : response.data.filePath,
					fileName : response.data.fileName
				});
				
				axios.post('/api/files/unzip', {filePath: this.state.filePath}).then((response)=> {
					if(response.data.success) {
						console.log("response.data.fileInfo", response.data.fileInfo);
						this.setState({fileList: response.data.fileInfo})
					} else {
						alert('압축을 해제하는데 실패했습니다.')
					}
				})
				
			} else {
				alert('파일을 저장하는데 실패했습니다.');
				console.log(response.data.err);
			}
		});
		
	} 
	
	onClick (value) {
		console.log("value", value)
		
		//Click시 Textarea 보이도록 함
		this.setState({toggleTextArea: true, clickedItem: value})
		
		//파일안 내용 불러오기
	}
	
	render() {
		
		const renderFileList = this.state.fileList.map((item, index) => {
			
			console.log(item)
			
			//Type: File
			if (item.fileType == 'File')
				return (<li onClick={(value) => this.onClick(item.name)} key={index}>{item.name}</li>)
			else //Type: Directory
				return (<li key={index}>{item.name}</li>)
		
		});
		
		
		return (
			<div className = {style.FileUpload}>
				<legend>File Upload</legend>
				<div className = {style.leftSide}>
					<Form onSubmit={this.onFormSubmit}>
						<FormGroup>
							<Label for="file">File</Label>
							<Input type="file" id="file" onChange={this.onChange}/>
						</FormGroup>
						<FormGroup>
							<Button type="submit">Upload</Button>
						</FormGroup>
						
					</Form>	
					<div>
						<ul>
							{renderFileList}
						</ul>
					</div>	
					
				</div>
				<div className = {style.rightSide}>
					{this.state.toggleTextArea &&
						<Form>
							<FormGroup>
								<Label for="textarea">Text Area</Label>
								<Input type="textarea" name="text" id="textarea" />
							</FormGroup>
							<FormGroup>
								<Button type="submit">Save</Button>
							</FormGroup>
						</Form>					
					}
				</div>
				
			</div>
		);
	}
}

export default FileUpload;