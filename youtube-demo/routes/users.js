const express = require("express");
const router = express.Router();
const conn = require("../mariadb");
const { body, param, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

router.use(express.json());

const validate = (req, res, next) => {
  const err = validationResult(req);

  if (err.isEmpty()) {
    return next(); // 다음 할 일 (미들 웨어, 함수)
  } else {
    return res.status(400).json(err.array());
  }
};

router.post(
  "/login",
  [
    body("umail").notEmpty().isEmail().withMessage("이메일 확인 필요"),
    body("pw").notEmpty().isString().withMessage("비밀번호 확인 필요"),
    validate,
  ],
  (req, res) => {
    let { umail, pw } = req.body;

    let sql = `select * from owners where umail= ?`;
    conn.query(sql, umail, function (err, results) {
      if (err) {
        return res.status(400).end();
      }

      loginUser = results[0];
      if (loginUser && loginUser.pw == pw) {
        // token 발급
        const token = jwt.sign(
          {
            umail: loginUser.umail,
            ownerName: loginUser.ownerName,
          },
          process.env.PRIVATE_KEY,
          {
            expiresIn: "5m",
            issuer: "dhlee",
          }
        );

        res.cookie("token", token, {
          httpOnly: true,
        });

        console.log(token);

        res.status(200).json({
          message: `${loginUser.ownerName}님 로그인 되었습니다.`,
        });
      } else {
        res.status(403).json({
          message: "아이디 또는 비밀번호가 틀렸습니다.",
        });
      }
    });
  }
);

router.post(
  "/join",
  [
    body("umail").notEmpty().isEmail().withMessage("이메일 확인 필요"),
    body("pw").notEmpty().isString().withMessage("비밀번호 확인 필요"),
    body("ownerName").notEmpty().isString().withMessage("이름 확인 필요"),
    body("tel").notEmpty().isString().withMessage("연락처 확인 필요"),
    validate,
  ],
  (req, res) => {
    const { umail, pw, ownerName, tel } = req.body;

    let sql = `INSERT INTO owners(umail, pw, ownerName, tel) 
  VALUES (?, ?, ?, ?)`;
    conn.query(sql, [umail, pw, ownerName, tel], function (err, results) {
      if (err) {
        return res.status(400).end();
      }

      res.status(201).json(results);
    });
  }
);

router
  .route("/users")
  .get(
    [
      body("umail").notEmpty().isEmail().withMessage("이메일 확인 필요"),
      validate,
    ],
    (req, res) => {
      let { umail } = req.body;

      let sql = `select * from owners where umail= ?`;
      conn.query(sql, umail, function (err, results) {
        if (err) {
          return res.status(400).end();
        }

        if (results.length) {
          res.status(200).json(results);
        } else {
          res.status(404).json({
            message: "회원 정보가 없습니다..",
          });
        }
      });
    }
  )
  .delete(
    [
      body("umail").notEmpty().isEmail().withMessage("이메일 확인 필요"),
      validate,
    ],
    (req, res) => {
      let { umail } = req.body;

      let sql = `DELETE FROM owners WHERE umail= ?`;
      conn.query(sql, umail, function (err, results) {
        if (err) {
          return res.status(400).end();
        }

        if (results.affectedRows == 0) {
          return res.status(400).end();
        } else {
          res.status(200).json({
            message: `채널이 정상적으로 삭제되었습니다.`,
          });
        }
      });
    }
  );

// 모듈화
module.exports = router;
