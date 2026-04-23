router.post("/update-category", (req, res) => {
  const { employeeId, category } = req.body;
  db.query(
    "UPDATE employee_m SET category = ? WHERE id = ?",
    [category, employeeId],
    (err) => {
      if (err) return res.status(500).send("Error ❌");
      res.send("Category updated ✅");
    }
  );
});