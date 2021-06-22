const router = require('express').Router();
const Error = require('../util/error');

const chat = require('../../../models/chat');

const add = async (message, userFrom, userTo, isWhisper) => {
	if (!message || !userFrom || !userTo) {
		throw new Error.InvalidRequest();
	}

	const newMessage = new chat({ message, userFrom, userTo, isWhisper });

	await newMessage.save();
	return true;
};
//보낸 메시지를 저장
router.post('/newMessage', async (req, res, next) => {
	try {
		const { message, userFrom, userTo, isWhisper } = req.body;
		const ret = await add(message, userFrom, userTo, isWhisper);
		res.send(ret);
	} catch (err) {
		next(err);
	}
});
//저장된 메시지를 불러옴
router.get('/getMessages', (req, res) => {
    
    chat.find() 
    //.populate('') 
    .exec((err, messages) => {
        if (err) return res.status(400).send(err)
        return res.status(200).json({success: true, messages})
    })
})
//저장된 메시지를 삭제
router.get('/removeMessages', (req, res) => {
    
    chat.remove({}) 
    //.populate('') 
    .exec((err, messages) => {
        if (err) return res.status(400).send(err)
        return res.status(200).json({success: true})
    })
})

module.exports = router;