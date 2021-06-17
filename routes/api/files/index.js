const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
//const unzipper = require('unzipper');
const unzip = require('unzip');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/');
	},
	filename: function (req, file, cb) {
		cb(null, `${file.originalname}`);
	}
});

/* const fileFilter = (req, file, cb) => {
	
	let typeArray = file.mimetype.split('/');
	let fileType = 	typeArray[1]
	
    // mime type 체크하여 이미지만 필터링
    if (fileType == 'zip' || fileType == 'tar') {
        cb(null, true);
    } else {
        cb(null, false);
    }
} */
const upload = multer({ storage: storage }).single('file');

router.post('/file', (req, res) => {
	
  upload(req, res, (err) => {
    if (err) {
      return req.json({ success: false, err });
    }
	  // filePath:res.req.file.path 어디에 파일이 저장되있는지 path(위치)를 가져올수있다.
	  // fileName: 저장된 파일의 이름을 가져올 수 있다.
	  return res.json({
      success: true,
      filePath: res.req.file.path,
      fileName: res.req.file.filename
    });
  });
});

router.post('/unzip', (req, res) => {
	
	//Zip 압축해제 후 지정 경로에 저장
	fs.createReadStream(req.body.filePath).pipe(unzip.Extract({ path: 'uploads/unzipped' }))

	//Zip 내부 각 파일 Parse
	var fileInfo = [] //client로 보내게 될 파일 정보
	fs.createReadStream(req.body.filePath)
		.pipe(unzip.Parse())
		.on('entry', function (entry) {
			var fileName = entry.path;
			var type = entry.type; // 'Directory' or 'File'
		
			fileInfo.push({name: fileName, fileType: type})
		
		})
		.on('close', function() {
		if (fileInfo.length == 0) {
			return res.json({ success: false, err: "파일정보를 불러오는 것에 실패했습니다." });
		} else {
			return res.json({
				success: true,
				fileInfo
			});
		}
	})
	
})

module.exports = router;