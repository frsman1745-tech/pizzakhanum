import express from "express";
import {
  getAllPizzas,
  getPizzaById,
  createPizza,
  updatePizza,
  deletePizza,
} from "../controllers/pizzaController.js";

const router = express.Router();

router.route("/").get(getAllPizzas).post(createPizza);
router.route("/:id").get(getPizzaById).put(updatePizza).delete(deletePizza);

export default router;
