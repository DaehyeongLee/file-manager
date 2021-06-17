import React from 'react';
import axios from 'axios';
import CenterLayout from 'components/CenterLayout';


class FileUpload extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = { 
			file : {},
			filePath: "",
			fileName: ""
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
				
				axios.post('/api/files/unzip', this.state).then((response)=> {
					if(response.data.success) {
						console.log("response.data.fileInfo", response.data.fileInfo);
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
	

	render() {
		return (
			<CenterLayout>
				<form onSubmit={this.onFormSubmit}>
					<h1>File Upload</h1>
					<input type="file" onChange={this.onChange}/>
					<button type="submit">Upload</button>
				</form>
			</CenterLayout>
		);
	}
}

export default FileUpload;