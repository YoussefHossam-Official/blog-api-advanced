import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { createPost, listPosts, getPost, updatePost, removePost, likePost, addComment, removeComment } from '../controllers/postController.js';

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Blog posts
 */

const router = Router();

/**
 * @swagger
 * /api/posts:
 *   get:
 *     tags: [Posts]
 *     summary: List posts
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of posts }
 */
router.get('/', listPosts);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     tags: [Posts]
 *     summary: Create post
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       201: { description: Created }
 */
router.post('/', auth, createPost);

/**
 * @swagger
 * /api/posts/{slug}:
 *   get:
 *     tags: [Posts]
 *     summary: Get a post by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Post }
 */
router.get('/:slug', getPost);

/**
 * @swagger
 * /api/posts/{slug}:
 *   patch:
 *     tags: [Posts]
 *     summary: Update post
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200: { description: Updated }
 */
router.patch('/:slug', auth, updatePost);

/**
 * @swagger
 * /api/posts/{slug}:
 *   delete:
 *     tags: [Posts]
 *     summary: Delete post
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
router.delete('/:slug', auth, removePost);

/**
 * @swagger
 * /api/posts/{slug}/like:
 *   post:
 *     tags: [Posts]
 *     summary: Toggle like
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Like status }
 */
router.post('/:slug/like', auth, likePost);

/**
 * @swagger
 * /api/posts/{slug}/comments:
 *   post:
 *     tags: [Posts]
 *     summary: Add comment
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content: { type: string }
 *     responses:
 *       201: { description: Comment added }
 */
router.post('/:slug/comments', auth, addComment);

/**
 * @swagger
 * /api/posts/{slug}/comments/{commentId}:
 *   delete:
 *     tags: [Posts]
 *     summary: Remove comment
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Comment removed }
 */
router.delete('/:slug/comments/:commentId', auth, removeComment);

export default router;
