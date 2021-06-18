const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const tar = require('tar');
//const unzipper = require('unzipper');
const unzip = require('unzip');

const unzippedPath = 'uploads/unzipped/'; //압축 해제된 폴더 경로

//업로드시 저장될 경로, 파일 이름 지정하는 multer storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/');
	},
	filename: function (req, file, cb) {
		cb(null, `${file.originalname}`);
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

//업로드된 파일 압축 해제 Router
router.post('/unzip', (req, res) => {
	
	const fileExtension = req.body.filePath.slice(-3);
	let fileInfo = [] //client로 보내게 될 파일 정보
	
	//파일이 zip일 경우
	//압축해제후 디렉토리명: unzipped
	if (fileExtension == 'zip') {
		//Zip 압축해제 후 지정 경로에 저장
		fs.createReadStream(req.body.filePath).pipe(unzip.Extract({ path: unzippedPath }))

		//Zip 내부 각 파일 Parse		
		fs.createReadStream(req.body.filePath)
			.pipe(unzip.Parse())
			.on('entry', function (entry) {
			var fileName = entry.path;
			var type = entry.type; // 'Directory' or 'File'
		
			fileInfo.push({name: fileName, fileType: type})
			
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
	//압축해제후 디렉토리명: tar파일 이름과 동일
	else {
		//tar 압축해제 후 지정 경로에 저장
		fs.createReadStream(req.body.filePath).pipe(
			tar.x({
				cwd: unzippedPath
			})
		)
		//tar 내부 각 파일 Parse
		.on('entry', function (entry) {
			var fileName = entry.path;
			var type = entry.type; // 'Directory' or 'File'
		
			fileInfo.push({name: fileName, fileType: type})
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
	const clickedItem = req.body.clickedItem;
	
	fs.readFile(`${unzippedPath}${clickedItem}`, 'utf-8', (err, data) => {
		if (err) throw err;
		return res.json({
				success: true,
				content: data
			});
	});
})

//선택된 파일 content 수정사항 반영해 저장하는 Router
router.post('/saveDetail', (req, res) => {
	const clickedItem = req.body.clickedItem;
	const clickedItemContent = req.body.clickedItemContent;
	
	fs.writeFile(`${unzippedPath}${clickedItem}`, clickedItemContent, 'utf-8', (err) => {
		if (err) throw err;
		return res.json({
				success: true
			});
	});
})

module.exports = router;