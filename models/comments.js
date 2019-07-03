const marked = require('marked')
const Comment = require('../lib/mongo').Comments

Comment.plugin('contentToHtml', {
  afterFind(comments) {
    return comments.map(comment => {
      comment.content = marked(comment.content)
      return comment
    })
  }
})

module.exports = {
  //创建一个留言
  create(data){
    return Comment.create(data).exec()
  },
  //通过留言id获取留言
  getCommentById(commentId){
    return Comment.findOne({_id: commentId}).exec()
  },
  //通过留言id删除留言
  delCommentById(commentId){
    return Comment.deleteOne({_id: commentId}).exec()
  },
  //通过文章Id删除该文章下的所有留言
  delCommentsByPostId(postId){
    return Comment.deleteMany({postId: postId}).exec()
  },
  //通过文章id获取该文章下所有留言
  getComments(postId){
    console.log(111111111)
    console.log(Comment
      .find({postId: postId}))
    return Comment
      .find({postId: postId})
      .populate({ path: 'author', model: 'User' })
      .sort({_id: 1})
      .addCreatedAt()
      .contentToHtml()
      .exec()
  },
  //通过文章id获取文章下留言数
  getCommentsCount(postId){
    return Comment.count({postId: postId}).exec()
  }
}
