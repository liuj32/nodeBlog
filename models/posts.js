const Post = require('../lib/mongo').Post
const marked = require('marked')
const CommentModel = require('./comments')

// 将 post 的 content 从 markdown 转换成 html
Post.plugin('contentToHtml', {
  afterFind: function (posts) {
    return posts.map(item => {
      item.content = marked(item.content)
      return item
    })
  },
  afterFindOne(post) {
    if (post) {
      post.content = marked(post.content)
      return post
    }
  }
})

//给post添加评论数commentsCount
Post.plugin('addCommentsCount', {
  afterFind: function (posts) {
    return Promise.all(posts.map(function (post) {
      return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
        post.commentsCount = commentsCount
        return post
      })
    }))
  },
  afterFindOne: function (post) {
    if(post){
      return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
        post.commentsCount = commentsCount
        return post
      })
    }
    return post
  }
})

module.exports = {
  // 创建一篇文章
  create: function (post) {
    return Post.create(post).exec()
  },
  //通过文章id获取文章
  getPostById(postId) {
    return Post
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' })
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .exec()
  },
  //按照时间排序获取一个用户下的所有文章
  getPosts(author) {
    let query = {}
    if (author) {
      query.author = author
    }
    return Post
      .find(query)
      .populate({ path: 'author', model: 'User' })
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .exec()
  },
  //通过文章id给pv 加 1
  incPv(postId) {
    return Post
      .update({ _id: postId }, { $inc: { pv: 1 } })
      .exec()
  },
  //获取原始文章
  getRawPostById(postId) {
    return Post
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' })
      .exec()
  },
  //更新文章
  updatePostById(postId, data) {
    return Post
      .update({ _id: postId }, { $set: data })
      .exec()
  },
  //通过文章id删除文章
  delPostById(postId, author) {
    return Post.deleteOne({author: author, _id: postId })
      .exec()
      .then(function (res) {
        if(res.result.ok && res.result.n>0){
          return CommentModel.delCommentById(postId)
        }
       })
  }
}
