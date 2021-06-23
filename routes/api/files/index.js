const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const tar = require('tar');
//const unzipper = require('unzipper');
const unzip = require('unzip');

const uploadedPath = 'uploads' //업로드되는 폴더 경로
const unzippedPath = 'uploads/unzipped'; //압축 해제된 폴더 경로

//업로드시 저장될 경로, 파일 이름 지정하는 multer storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadedPath);
	},
	filename: function (req, file, cb) {
		cb(null, `${Date.now()}_${file.originalname}`);
	}
});
const upload = multer({ storage: storage }).single('file'); //업로드시 사용되는 multer

//파일 업로드 Router
router.post('/file', (req, res) => {
	
  upload(req, res, (err) => {
    if (err) {
      return req.json({ success: false, err });
    }
	  // filePath:res.req.file.path 어디에 파일이 저장되있는지 path(위치)를 가져올수있다.
	  // fileName: 저장된 파일의 이름을 가져올 수 있다.
	  return res.json({
		  success: true,
		  filePath: res.req.file ? res.req.file.path : "", //파일 업로드 취소시 empty string을 response로 보낸다
		  fileName: res.req.file ? res.req.file.filename : "" //파일 업로드 취소시 empty string을 response로 보낸다
	  });
  });
});

//기존에 업로드된 파일 삭제 Router
// router.post('/delete', (req, res) => {
	
// 	var deleteFolderRecursive = function(path) {
// 		// existsSync: 파일이나 폴더가 존재하는 파악
// 		if (fs.existsSync(path)) {                  

// 			//unzippedPath 안 파일을 모두 삭제한다.
// 			//readdir(path): 디렉토리 안의 파일의 이름을 배열로 반환
// 			fs.readdirSync(path).forEach(function(file, index){   
// 				var curPath = path + "/" + file;
				
// 				// lstat: stat값을 반환함, isDirectory(): 디렉토리인지 파악
// 				if (fs.lstatSync(curPath).isDirectory()) {
// 					deleteFolderRecursive(curPath); //재귀
// 				} else {
// 					fs.unlinkSync(curPath); //unlinkSync: 파일 삭제                     
// 				}
// 			});
// 			fs.rmdirSync(path); //rmdirSync: 폴더 삭제                             
// 		}
// 	};
	
// 	deleteFolderRecursive(uploadedPath);
	
// 	if (!fs.existsSync(uploadedPath)){
		
// 		fs.mkdirSync(uploadedPath); //삭제 성공시 upload될 폴더 생성
// 		if (!fs.existsSync(unzippedPath)) 
// 			fs.mkdirSync(unzippedPath); //삭제 성공시 unzip될 폴더를 생성
// 		return res.json({
// 			success: true
// 		});		
// 	}
// })

//업로드된 파일 압축 해제 Router
router.post('/unzip', (req, res) => {
	
	let fileInfo = [] //client로 보내게 될 파일 정보
	
	const dotSeparation = req.body.fileName.split('.');
	const fileName = dotSeparation[0]; //확장자를 제외한 파일이름
	const fileExtension = dotSeparation[1]; //확장자
	//const fileExtension = req.body.filePath.slice(-3);
	
	if (!fs.existsSync(unzippedPath)) 
		fs.mkdirSync(unzippedPath); //unzip될 경로에 폴더가 없을시 폴더 생성
	fs.mkdirSync(`${unzippedPath}/${fileName}`); //unzip될 경로안에 파일이름으로 된 폴더 생성. 압축해제된 파일들은 각 폴더 내로 들어감
		
	//파일이 zip일 경우
	//압축해제후 디렉토리명: unzipped/{fileName}
	if (fileExtension == 'zip') {
		//Zip 압축해제 후 지정 경로에 저장
		fs.createReadStream(req.body.filePath).pipe(unzip.Extract({ path: `${unzippedPath}/${fileName}` }))

		//Zip 내부 각 파일 Parse		
		fs.createReadStream(req.body.filePath)
			.pipe(unzip.Parse())
			.on('entry', function (entry) {
			var filePath = entry.path;
			var fileType = entry.type; // 'Directory' or 'File'
		
			fileInfo.push({filePath: filePath, fileType: fileType})
		})
		//Zip 내부 파일 Parse 종료 후
		.on('close', function() {
			if (fileInfo.length == 0) {
				return res.json({ success: false, err: "압축된 파일의 리스트업에 실패했습니다." });
			} else {
				return res.json({
					success: true,
					fileInfo
				});
			}
		})
	} 
	//파일이 tar일 경우
	//압축해제후 디렉토리명: unzipped/{fileName}
	else {
		//tar 압축해제 후 지정 경로에 저장
		fs.createReadStream(req.body.filePath).pipe(
			tar.x({
				cwd: `${unzippedPath}/${fileName}`,
				strip: 1
			})
		)
		//tar 내부 각 파일 Parse
		.on('entry', function (entry) {
			var filePath = entry.path;
			var fileType = entry.type; // 'Directory' or 'File'
		
			fileInfo.push({filePath: filePath, fileType: fileType})
		})
		//tar 내부 파일 Parse 종료 후
		.on('close', function() {
			if (fileInfo.length == 0) {
				return res.json({ success: false, err: "압축된 파일의 리스트업에 실패했습니다." });
			} else {
				return res.json({
					success: true,
					fileInfo
				});
			}
		})
	}
})

//선택된 파일 content 읽는 Router
router.post('/detail', (req, res) => {
	
	const dotSeparation = req.body.fileName.split('.');
	const fileName = dotSeparation[0];
	
	const clickedItem = req.body.clickedItem;
	
	fs.readFile(`${unzippedPath}/${fileName}/${clickedItem}`, 'utf-8', (err, data) => {
		if (err) throw err;
		return res.json({
				success: true,
				content: data
			});
	});
})

//선택된 파일 content 수정사항 반영해 저장하는 Router
router.post('/saveDetail', (req, res) => {
	
	const dotSeparation = req.body.fileName.split('.');
	const fileName = dotSeparation[0];
	
	const clickedItem = req.body.clickedItem;
	const clickedItemContent = req.body.clickedItemContent;
	
	fs.writeFile(`${unzippedPath}/${fileName}/${clickedItem}`, clickedItemContent, 'utf-8', (err) => {
		if (err) throw err;
		return res.json({
				success: true
			});
	});
})

module.exports = router;