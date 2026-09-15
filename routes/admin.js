const express = require("express");
const bcrypt = require("bcryptjs");
const supabase = require("../supabase");

const router = express.Router();

const ESTADOS = ["Pendiente", "En revisión", "Resuelto"];

router.get("/login", (req, res) => {
  res.render("admin/login");
});

router.post("/login", async (req, res) => {
  const { usuario, password } = req.body;
  const { data: admin } = await supabase
    .from("admin")
    .select("*")
    .eq("usuario", usuario)
    .maybeSingle();

  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).render("admin/login", { error: "Usuario o contraseña incorrectos" });
  }

  req.session.admin = { id: Number(admin.id), usuario: admin.usuario };
  res.redirect("/admin");
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

router.use((req, res, next) => {
  if (!req.session.admin) {
    return res.redirect("/admin/login");
  }
  next();
});

router.get("/", async (req, res) => {
  const { data: todos } = await supabase
    .from("reportes")
    .select("*")
    .order("id", { ascending: false });

  const reportes = todos || [];
  const estado = req.query.estado || "Todos";
  const filtrados = estado === "Todos" ? reportes : reportes.filter((r) => r.estado === estado);

  const conteos = {};
  for (const e of ESTADOS) {
    conteos[e] = reportes.filter((r) => r.estado === e).length;
  }
  conteos["Todos"] = reportes.length;

  res.render("admin/panel", { reportes: filtrados, estados: ESTADOS, estado, conteos });
});

router.post("/reportes/:id/estado", async (req, res) => {
  const { estado } = req.body;
  if (!ESTADOS.includes(estado)) {
    return res.status(400).render("error", { mensaje: "Estado no válido" });
  }
  await supabase.from("reportes").update({ estado }).eq("id", req.params.id);
  res.redirect("/admin");
});

module.exports = router;
