const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const redirectURL =
  process.env.NODE_ENV === "production"
    ? "배포주소"
    : "http://localhost:8000/api/auth/github/callback";
const frontMainURL =
  process.env.NODE_ENV === "production"
    ? "배포주소"
    : "http://localhost:5173/our";

const getGithubRedirectURL = (req, res) => {
  const githubAuthURL = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectURL}&scope=user`;
  res.json({ redirect: githubAuthURL });
};

const getGithubCallback = async (req, res) => {
  const { code } = req.query;

  //Authorization Code가 없는 경우
  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  try {
    //Authorization Code를 사용하여 Github Access Token 가져오기
    const tokenResponse = await fetch(
      `https://github.com/login/oauth/access_token`,
      {
        method: "POST",
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    ).then((res) => res.json());

    const accessToken = tokenResponse.access_token;

    // AccessToken이 없다면 400 리턴
    if (!accessToken) {
      return res.status(400).json({ error: "Failed to retrieve access token" });
    }

    // AccessToken을 사용하여 Github 유저 정보 가져오기
    const userData = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((res) => res.json());

    // 가져온 유저 ID를 JWT로 변환
    const token = jwt.sign({ id: userData.login }, secret, {});

    // cookie에 JWT를 넣어준다.
    res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .redirect(frontMainURL);
  } catch (error) {
    console.error("Error during GitHub authentication:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const logout = (req, res) => {
  // "token" 쿠키 삭제
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    expires: new Date(0),
  });
  res.json("로그아웃 되었습니다.");
};

module.exports = {
  getGithubCallback,
  getGithubRedirectURL,
  logout,
};
