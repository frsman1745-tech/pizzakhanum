import Pizza from "../models/Pizza.js";

// ─── GET ALL PIZZAS ────────────────────────────────────────────────────────────
export const getAllPizzas = async (req, res) => {
  try {
    const { category, available } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (available !== undefined) filter.available = available === "true";

    const pizzas = await Pizza.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: pizzas.length, data: pizzas });
  } catch (error) {
    console.error("[getAllPizzas]", error.message);
    res.status(500).json({ success: false, message: "Server error while fetching pizzas." });
  }
};

// ─── GET SINGLE PIZZA ─────────────────────────────────────────────────────────
export const getPizzaById = async (req, res) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) {
      return res.status(404).json({ success: false, message: "Pizza not found." });
    }
    res.status(200).json({ success: true, data: pizza });
  } catch (error) {
    console.error("[getPizzaById]", error.message);
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid pizza ID format." });
    }
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── CREATE PIZZA ─────────────────────────────────────────────────────────────
export const createPizza = async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, available, toppings, size } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: "Name and price are required." });
    }

    const pizza = await Pizza.create({
      name,
      description,
      price,
      imageUrl,
      category,
      available,
      toppings,
      size,
    });

    res.status(201).json({ success: true, data: pizza });
  } catch (error) {
    console.error("[createPizza]", error.message);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Server error while creating pizza." });
  }
};

// ─── UPDATE PIZZA ─────────────────────────────────────────────────────────────
export const updatePizza = async (req, res) => {
  try {
    const pizza = await Pizza.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!pizza) {
      return res.status(404).json({ success: false, message: "Pizza not found." });
    }

    res.status(200).json({ success: true, data: pizza });
  } catch (error) {
    console.error("[updatePizza]", error.message);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid pizza ID format." });
    }
    res.status(500).json({ success: false, message: "Server error while updating pizza." });
  }
};

// ─── DELETE PIZZA ─────────────────────────────────────────────────────────────
export const deletePizza = async (req, res) => {
  try {
    const pizza = await Pizza.findByIdAndDelete(req.params.id);

    if (!pizza) {
      return res.status(404).json({ success: false, message: "Pizza not found." });
    }

    res.status(200).json({ success: true, message: "Pizza deleted successfully.", data: pizza });
  } catch (error) {
    console.error("[deletePizza]", error.message);
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid pizza ID format." });
    }
    res.status(500).json({ success: false, message: "Server error while deleting pizza." });
  }
};
