import { Router } from "express";
import { 
    createBoard,
    getBoard,
    getAllBoard,
    updateBoard,
    deleteBoard,

} from "../controllers/boards.controllers.js"
const router = Router()

router.route("/createBoard/:userId").post(createBoard)
router.route("/getBoard/:boardId").get(getBoard)
router.route("/getAllBoard/:userId").get(getAllBoard)
router.route("/updateBoard/:userId/:boardId").post(updateBoard)


export default router
