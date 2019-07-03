const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const CommentModel = require('../models/comments')

// POST /comments 创建一条留言
router.post('/', checkLogin, function (req, res, next) {
   const postId = req.fields.postId
   const author = req.session.user._id
   const content = req.fields.content

   try{
     if(!content.length){
       throw new Error("留言内容不能为空")
     }
   }catch(e){
      req.flash('error', e.message)
      return res.redirect('back')
   }
   
   let comment = {
     postId,
     author,
     content
   }
   
   CommentModel.create(comment).then(function(){
     req.flash('success', '留言成功')
     return res.redirect('back')
   })
   .catch(next)

})

// GET /comments/:commentId/remove 删除一条留言
router.get('/:commentId/remove', checkLogin, function (req, res, next) {
  const commentId = req.params.commentId
  const author = req.session.user._id 

  CommentModel.getCommentById(commentId).then(function(comment){
    if(!comment){
      throw new Error('留言不存在')
    }
    if(comment.author.toString() != author.toString()){
      throw new Error('你没有权限')
    }

    CommentModel.delCommentById(commentId).then(function(){
      req.flash('success', '删除成功')
      return res.redirect('back')
    }).catch(next)
  })
  .catch(next)
})

module.exports = router
