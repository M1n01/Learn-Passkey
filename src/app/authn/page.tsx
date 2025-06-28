"use client";

import FingerprintIcon from "@mui/icons-material/Fingerprint";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Button,
  Container,
  Paper,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import styles from "./page.module.css";

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [username, setUsername] = useState("");

  const handleRegister = async () => {
    const optionsResponse = await fetch(
      "/api/authn/passkey/registration/options",
      {
        method: "POST",
        body: JSON.stringify({ username }),
      },
    );
    const { options, sessionId } = await optionsResponse.json();

    console.log(options, sessionId);

    // TODO: パスキーを登録
    // TODO: 登録を検証
    // TODO: パスキーを削除
  };

  return (
    <Box className={styles.bg}>
      <Container maxWidth="xs" sx={{ px: { xs: 0, sm: 2 } }}>
        <Paper elevation={6} className={styles.card}>
          <Typography variant="h4" component="h1" className={styles.title}>
            Learn Passkey
          </Typography>
          <TabContext value={tab}>
            <TabList
              onChange={(_event, value) => setTab(value)}
              aria-label="auth tabs"
              centered
              className={styles.tabs}
            >
              <Tab
                icon={<LoginIcon />}
                iconPosition="start"
                label="ログイン"
                value="login"
                className={styles.tab}
              />
              <Tab
                icon={<PersonAddAlt1Icon />}
                iconPosition="start"
                label="新規登録"
                value="register"
                className={styles.tab}
              />
            </TabList>
            <Box className={styles.panelWrapper}>
              <TabPanel value="login" sx={{ width: "100%", p: 0 }}>
                <Box
                  component="form"
                  noValidate
                  autoComplete="off"
                  className={styles.form}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    startIcon={<FingerprintIcon />}
                    className={styles.button}
                  >
                    パスキーでログイン
                  </Button>
                </Box>
              </TabPanel>
              <TabPanel value="register" sx={{ width: "100%", p: 0 }}>
                <Box
                  component="form"
                  noValidate
                  autoComplete="off"
                  className={styles.form}
                >
                  <TextField
                    label="ユーザー名"
                    placeholder="ユーザー名を入力"
                    type="text"
                    fullWidth
                    required
                    margin="normal"
                    variant="outlined"
                    sx={{ mb: 2 }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    fullWidth
                    startIcon={<FingerprintIcon />}
                    className={`${styles.button} ${styles.buttonSecondary}`}
                    onClick={handleRegister}
                  >
                    パスキーで新規登録
                  </Button>
                </Box>
              </TabPanel>
            </Box>
          </TabContext>
        </Paper>
      </Container>
    </Box>
  );
}
