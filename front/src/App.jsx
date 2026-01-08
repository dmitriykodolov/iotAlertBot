import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Lamp,
  Link,
  RefreshCcw,
  Search,
  ShieldCheck,
  Timer,
  Webhook,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function apiFetch(path, { method = "GET", body } = {}) {
  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await resp.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!resp.ok) {
    const message = data?.detail || data?.message || text || `HTTP ${resp.status}`;
    throw new Error(message);
  }

  return data;
}

const StepShell = ({ title, subtitle, children }) => (
  <div className="max-w-2xl mx-auto">
    <div className="mb-6">
      <div className="text-2xl font-semibold tracking-tight">{title}</div>
      {subtitle ? (
        <div className="text-sm text-muted-foreground mt-1">{subtitle}</div>
      ) : null}
    </div>
    {children}
  </div>
);

const Field = ({ label, hint, children, error }) => (
  <div className="space-y-2">
    <div className="flex items-baseline justify-between gap-4">
      <div className="text-sm font-medium">{label}</div>
      {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
    </div>
    {children}
    {error ? <div className="text-xs text-red-600">{error}</div> : null}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className={
      "w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 transition bg-white " +
      (props.className || "")
    }
  />
);

const Button = ({ variant = "primary", className = "", ...props }) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-black text-white hover:bg-black/90",
    secondary: "bg-black/5 hover:bg-black/10 text-black",
    ghost: "hover:bg-black/5 text-black",
    danger: "bg-red-600 text-white hover:bg-red-600/90",
  };
  return <button {...props} className={`${base} ${styles[variant]} ${className}`} />;
};

const Card = ({ children, className = "" }) => (
  <div className={`rounded-3xl border bg-white shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ icon: Icon, title, subtitle, right }) => (
  <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
    <div className="flex items-start gap-3">
      {Icon ? (
        <div className="rounded-2xl bg-black/5 p-2.5">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <div>
        <div className="font-semibold">{title}</div>
        {subtitle ? <div className="text-sm text-muted-foreground mt-1">{subtitle}</div> : null}
      </div>
    </div>
    {right}
  </div>
);

const Divider = () => <div className="h-px bg-black/10" />;

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium">
    {children}
  </span>
);

const Dot = ({ online }) => (
  <span
    className={
      "inline-block h-2.5 w-2.5 rounded-full " +
      (online ? "bg-emerald-500" : "bg-red-500")
    }
  />
);

const StatusChip = ({ status, label }) => {
  const tone =
    status === true ? "bg-emerald-100 text-emerald-800" : status === false ? "bg-red-100 text-red-700" : "bg-neutral-100 text-neutral-600";
  const text = status === true ? "OK" : status === false ? "ERROR" : "—";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${tone}`}>
      {label}
      <span className="text-[10px] uppercase tracking-wide">{text}</span>
    </span>
  );
};

const StatusLine = ({ label, status, message }) => {
  const text = status === true ? "OK" : status === false ? "ERROR" : "—";
  const detail = message ? ` (${message})` : "";
  return (
    <div className="text-xs text-muted-foreground">
      <span className="text-black">{label}</span>: {text}
      {detail}
    </div>
  );
};

const Progress = ({ step }) => {
  const items = [
    { id: 1, label: "Токены" },
    { id: 2, label: "Устройство" },
    { id: 3, label: "Отображение" },
  ];

  return (
    <div className="max-w-2xl mx-auto mb-6">
      <div className="flex items-center justify-between gap-3">
        {items.map((it, idx) => {
          const done = it.id < step;
          const active = it.id === step;
          return (
            <React.Fragment key={it.id}>
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={
                    "h-9 w-9 rounded-2xl flex items-center justify-center border text-sm font-semibold " +
                    (done
                      ? "bg-black text-white border-black"
                      : active
                      ? "bg-white border-black"
                      : "bg-white border-black/20 text-black/50")
                  }
                  aria-label={`Шаг ${it.id}`}
                >
                  {done ? <Check className="h-4 w-4" /> : it.id}
                </div>
                <div className="min-w-0">
                  <div
                    className={
                      "text-sm font-medium truncate " +
                      (active ? "text-black" : done ? "text-black" : "text-black/50")
                    }
                  >
                    {it.label}
                  </div>
                  <div className="text-xs text-muted-foreground">Экран {it.id}</div>
                </div>
              </div>
              {idx !== items.length - 1 ? (
                <div className="flex-1 h-px bg-black/10" />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

function normalizeHex(hex) {
  if (!hex) return "";
  let v = hex.trim();
  if (v.startsWith("#")) v = v.slice(1);
  if (v.length === 3) v = v.split("").map((c) => c + c).join("");
  if (v.length !== 6) return "";
  return "#" + v.toUpperCase();
}

function isValidHex(hex) {
  const v = normalizeHex(hex);
  return /^#[0-9A-F]{6}$/.test(v);
}

const Palette = ({ value, onPick }) => {
  const swatches = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFD400",
    "#FF7A00",
    "#E30306",
    "#E3C803",
    "#00C2FF",
    "#9B5CFF",
    "#FFFFFF",
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {swatches.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onPick(c)}
          className={
            "h-9 w-9 rounded-2xl border shadow-sm transition hover:scale-[1.02] active:scale-[0.99] " +
            (normalizeHex(value) === c ? "ring-2 ring-black/20" : "")
          }
          style={{ backgroundColor: c }}
          aria-label={`Выбрать ${c}`}
        />
      ))}
    </div>
  );
};

const defaultVerifyState = {
  yandex: { ok: null, message: "не проверяли" },
  telegram: { ok: null, message: "не проверяли" },
  ngrok: { ok: null, message: "не проверяли" },
};

export default function App() {
  const [step, setStep] = useState(1);

  // Step 1
  const [yandexToken, setYandexToken] = useState("");
  const [telegramToken, setTelegramToken] = useState("");
  const [ngrokToken, setNgrokToken] = useState("");
  const [showTokens, setShowTokens] = useState({
    yandex: false,
    telegram: false,
    ngrok: false,
  });
  const [touched, setTouched] = useState({
    yandex: false,
    telegram: false,
    ngrok: false,
  });
  const [verifyStatus, setVerifyStatus] = useState(defaultVerifyState);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [savingCredentials, setSavingCredentials] = useState(false);

  // Step 2
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [devicesError, setDevicesError] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [deviceSaveError, setDeviceSaveError] = useState("");
  const [deviceSearch, setDeviceSearch] = useState("");

  // Step 3
  const [alertMode, setAlertMode] = useState("single");
  const [color1, setColor1] = useState("#FF0000");
  const [color2, setColor2] = useState("#E30306");
  const [durationSec, setDurationSec] = useState(10);
  const [blinkInterval, setBlinkInterval] = useState(0.5);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [testLog, setTestLog] = useState([]);
  const [testLoading, setTestLoading] = useState(false);

  const resetDeviceState = () => {
    setDevices([]);
    setSelectedDeviceId("");
    setDevicesError("");
    setDeviceSaveError("");
    setDeviceSearch("");
  };

  const tokenErrors = useMemo(() => {
    const e = {};
    if (!yandexToken.trim()) e.yandexToken = "Нужен OAuth токен Яндекс IoT";
    if (!telegramToken.trim()) e.telegramToken = "Нужен токен Telegram бота";
    if (!ngrokToken.trim()) e.ngrokToken = "Нужен токен ngrok";
    return e;
  }, [yandexToken, telegramToken, ngrokToken]);

  const canGoStep1 = Object.keys(tokenErrors).length === 0;

  const selectedDevice = useMemo(
    () => devices.find((d) => d.id === selectedDeviceId) || null,
    [devices, selectedDeviceId]
  );

  const color1Ok = isValidHex(color1);
  const color2Ok = isValidHex(color2);

  const canGoStep2 = Boolean(selectedDeviceId);

  const canFinish =
    canGoStep2 &&
    color1Ok &&
    Number.isFinite(durationSec) &&
    durationSec > 0 &&
    (alertMode === "single" || (color2Ok && Number.isFinite(blinkInterval) && blinkInterval > 0));

  const filteredDevices = useMemo(() => {
    const q = deviceSearch.trim().toLowerCase();
    if (!q) return devices;
    return devices.filter((d) =>
      [d.name, d.id].some((value) => String(value || "").toLowerCase().includes(q))
    );
  }, [devices, deviceSearch]);

  const resetVerify = () => {
    setVerifyStatus(defaultVerifyState);
    setVerifyError("");
  };

  const saveCredentials = async () => {
    setSavingCredentials(true);
    try {
      await apiFetch("/setup/credentials", {
        method: "POST",
        body: {
          yandex_token: yandexToken,
          telegram_bot_token: telegramToken,
          ngrok_authtoken: ngrokToken,
        },
      });
    } finally {
      setSavingCredentials(false);
    }
  };

  const handleVerify = async () => {
    setTouched({ yandex: true, telegram: true, ngrok: true });
    if (!canGoStep1) return;

    setVerifyLoading(true);
    setVerifyError("");
    try {
      await saveCredentials();
      const result = await apiFetch("/setup/verify", {
        method: "POST",
        body: {
          yandex_token: yandexToken,
          telegram_bot_token: telegramToken,
          ngrok_authtoken: ngrokToken,
        },
      });
      setVerifyStatus(result || defaultVerifyState);
    } catch (err) {
      setVerifyError(err.message || "Не удалось проверить подключения");
      setVerifyStatus(defaultVerifyState);
    } finally {
      setVerifyLoading(false);
    }
  };

  const loadDevices = async () => {
    setLoadingDevices(true);
    setDevicesError("");
    try {
      const data = await apiFetch("/setup/devices");
      const list = Array.isArray(data?.devices) ? data.devices : [];
      setDevices(list);
      if (list.length === 0) {
        setSelectedDeviceId("");
      } else if (!list.some((d) => d.id === selectedDeviceId)) {
        setSelectedDeviceId(list[0].id);
      }
    } catch (e) {
      setDevicesError(e.message || "Не удалось получить список устройств");
    } finally {
      setLoadingDevices(false);
    }
  };

  const saveDevice = async (deviceId) => {
    setDeviceSaveError("");
    try {
      await apiFetch("/setup/device", {
        method: "POST",
        body: { device_id: deviceId },
      });
      return true;
    } catch (e) {
      setDeviceSaveError(e.message || "Не удалось сохранить устройство");
      return false;
    }
  };

  const saveAlertSettings = async () => {
    setSettingsSaving(true);
    setSettingsMessage("");
    const safeColor1 = normalizeHex(color1);
    const safeColor2 = color2Ok ? normalizeHex(color2) : safeColor1;
    const safeBlink = alertMode === "rainbow" ? blinkInterval : 0.5;
    try {
      await apiFetch("/setup/alert-settings", {
        method: "POST",
        body: {
          color_hex: safeColor1,
          color_hex_2: safeColor2,
          duration_sec: durationSec,
          blink_interval_sec: safeBlink,
        },
      });
      setSettingsMessage("Сохранено");
    } catch (e) {
      setSettingsMessage(e.message || "Ошибка сохранения");
    } finally {
      setSettingsSaving(false);
    }
  };

  const runTest = async () => {
    setTestLoading(true);
    setTestLog(["started..."]);
    const safeColor1 = normalizeHex(color1);
    const safeColor2 = color2Ok ? normalizeHex(color2) : safeColor1;
    try {
      if (alertMode === "single") {
        await apiFetch("/startAlert", {
          method: "POST",
          body: { color_hex: safeColor1, duration_sec: durationSec },
        });
      } else {
        await apiFetch("/startAlertRainbow", {
          method: "POST",
          body: {
            color_hex: safeColor1,
            color_hex_2: safeColor2,
            duration_sec: durationSec,
          },
        });
      }
      setTestLog((prev) => [...prev, "done"]);
    } catch (e) {
      setTestLog((prev) => [...prev, `error: ${e.message || "failed"}`]);
    } finally {
      setTestLoading(false);
    }
  };

  const goNext = async () => {
    if (step === 1) {
      setTouched({ yandex: true, telegram: true, ngrok: true });
      if (!canGoStep1) return;
      try {
        await saveCredentials();
      } catch (e) {
        setVerifyError(e.message || "Не удалось сохранить токены");
        return;
      }
      setStep(2);
      if (devices.length === 0) await loadDevices();
      return;
    }
    if (step === 2) {
      if (!canGoStep2) return;
      const ok = await saveDevice(selectedDeviceId);
      if (!ok) return;
      setStep(3);
      return;
    }
  };

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const summary = useMemo(() => {
    return {
      tokens: {
        yandex: yandexToken ? "••••••" + yandexToken.trim().slice(-4) : "",
        telegram: telegramToken ? "••••••" + telegramToken.trim().slice(-4) : "",
        ngrok: ngrokToken ? "••••••" + ngrokToken.trim().slice(-4) : "",
      },
      device: selectedDevice,
      display: {
        color1: normalizeHex(color1),
        color2: normalizeHex(color2),
        durationSec,
        blinkInterval,
      },
    };
  }, [yandexToken, telegramToken, ngrokToken, selectedDevice, color1, color2, durationSec, blinkInterval]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="px-4 py-10">
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-3xl font-semibold tracking-tight">iotalarm</div>
              <div className="text-sm text-muted-foreground mt-1">
                Настройка токенов, выбор лампы и параметров алерта
              </div>
            </div>
            <Badge>setup</Badge>
          </div>
        </div>

        <Progress step={step} />

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <StepShell
                title="Экран 1 — Верификация в сервисах"
                subtitle="Введите токены и проверьте, что они активны."
              >
                <Card>
                  <CardHeader
                    icon={ShieldCheck}
                    title="Подключения"
                    subtitle="Yandex IoT OAuth, Telegram Bot Token, ngrok Token"
                    right={
                      <Button
                        variant="secondary"
                        onClick={handleVerify}
                        disabled={verifyLoading || savingCredentials}
                      >
                        {verifyLoading ? "Проверяем..." : "Проверить подключения"}
                      </Button>
                    }
                  />
                  <Divider />
                  <div className="p-5 sm:p-6 space-y-5">
                    <Field
                      label="Yandex IoT Token"
                      hint="OAuth token для API Яндекс IoT"
                      error={touched.yandex ? tokenErrors.yandexToken : ""}
                    >
                      <div className="relative">
                        <KeyRound className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                        <Input
                          type={showTokens.yandex ? "text" : "password"}
                          value={yandexToken}
                          onChange={(e) => {
                            setYandexToken(e.target.value);
                            resetVerify();
                            resetDeviceState();
                          }}
                          onBlur={() => setTouched((prev) => ({ ...prev, yandex: true }))}
                          placeholder="AQAAAA..."
                          className="pl-11 pr-11"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowTokens((prev) => ({ ...prev, yandex: !prev.yandex }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-black/40 hover:text-black"
                          aria-label="Показать токен"
                        >
                          {showTokens.yandex ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </Field>

                    <Field
                      label="Telegram Bot Token"
                      hint="placeholder: 123456:ABC-..."
                      error={touched.telegram ? tokenErrors.telegramToken : ""}
                    >
                      <div className="relative">
                        <Webhook className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                        <Input
                          type={showTokens.telegram ? "text" : "password"}
                          value={telegramToken}
                          onChange={(e) => {
                            setTelegramToken(e.target.value);
                            resetVerify();
                          }}
                          onBlur={() => setTouched((prev) => ({ ...prev, telegram: true }))}
                          placeholder="123456:ABC-DEF..."
                          className="pl-11 pr-11"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowTokens((prev) => ({ ...prev, telegram: !prev.telegram }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-black/40 hover:text-black"
                          aria-label="Показать токен"
                        >
                          {showTokens.telegram ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </Field>

                    <Field
                      label="NGROK Token"
                      hint="нужен для авто-поднятия туннеля/вебхука (если используешь)"
                      error={touched.ngrok ? tokenErrors.ngrokToken : ""}
                    >
                      <div className="relative">
                        <Link className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                        <Input
                          type={showTokens.ngrok ? "text" : "password"}
                          value={ngrokToken}
                          onChange={(e) => {
                            setNgrokToken(e.target.value);
                            resetVerify();
                          }}
                          onBlur={() => setTouched((prev) => ({ ...prev, ngrok: true }))}
                          placeholder="2wG..."
                          className="pl-11 pr-11"
                        />
                        <button
                          type="button"
                          onClick={() => setShowTokens((prev) => ({ ...prev, ngrok: !prev.ngrok }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-black/40 hover:text-black"
                          aria-label="Показать токен"
                        >
                          {showTokens.ngrok ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </Field>

                    {verifyError ? (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                        {verifyError}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      <StatusChip status={verifyStatus.yandex?.ok} label="Yandex IoT" />
                      <StatusChip status={verifyStatus.telegram?.ok} label="Telegram" />
                      <StatusChip status={verifyStatus.ngrok?.ok} label="Ngrok" />
                    </div>
                    <div className="space-y-1">
                      <StatusLine
                        label="Yandex IoT"
                        status={verifyStatus.yandex?.ok}
                        message={verifyStatus.yandex?.message}
                      />
                      <StatusLine
                        label="Telegram"
                        status={verifyStatus.telegram?.ok}
                        message={verifyStatus.telegram?.message}
                      />
                      <StatusLine
                        label="Ngrok"
                        status={verifyStatus.ngrok?.ok}
                        message={verifyStatus.ngrok?.message}
                      />
                    </div>
                  </div>
                </Card>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <Button variant="ghost" disabled>
                    <ChevronLeft className="h-4 w-4" /> Назад
                  </Button>
                  <Button onClick={goNext} disabled={!canGoStep1 || savingCredentials}>
                    Далее <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </StepShell>
            </motion.div>
          ) : null}

          {step === 2 ? (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <StepShell
                title="Экран 2 — Выбор устройства"
                subtitle='Берём устройства из /v1.0/user/info и фильтруем type начиная с "devices.types.light".'
              >
                <Card>
                  <CardHeader
                    icon={Lamp}
                    title="Устройства освещения"
                    subtitle="Выберите лампу, с которой будет работать алерт"
                    right={
                      <Button
                        variant="secondary"
                        onClick={loadDevices}
                        disabled={loadingDevices}
                        className="whitespace-nowrap"
                      >
                        <RefreshCcw className={"h-4 w-4 " + (loadingDevices ? "animate-spin" : "")}
                        />
                        Обновить
                      </Button>
                    }
                  />
                  <Divider />
                  <div className="p-5 sm:p-6 space-y-4">
                    <Field label="Поиск" hint="по имени или id">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                        <Input
                          value={deviceSearch}
                          onChange={(e) => setDeviceSearch(e.target.value)}
                          placeholder="Поиск..."
                          className="pl-11"
                        />
                      </div>
                    </Field>

                    {devicesError ? (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {devicesError}
                        <div className="mt-3">
                          <Button variant="secondary" onClick={loadDevices}>
                            Повторить
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    {deviceSaveError ? (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {deviceSaveError}
                      </div>
                    ) : null}

                    <Field label="Выберите устройство" hint="online/offline + type">
                      <div className="space-y-2">
                        {loadingDevices
                          ? Array.from({ length: 4 }).map((_, idx) => (
                              <div
                                key={`skeleton-${idx}`}
                                className="h-14 rounded-2xl bg-black/5 animate-pulse"
                              />
                            ))
                          : null}

                        {!loadingDevices && filteredDevices.length === 0 ? (
                          <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                            Лампочки не найдены. Проверь токен и доступ.
                          </div>
                        ) : null}

                        {!loadingDevices
                          ? filteredDevices.map((d) => (
                              <label
                                key={d.id}
                                className={
                                  "flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition cursor-pointer " +
                                  (selectedDeviceId === d.id
                                    ? "border-black/40 bg-black/5"
                                    : "hover:bg-black/5")
                                }
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name="device"
                                    value={d.id}
                                    checked={selectedDeviceId === d.id}
                                    onChange={() => setSelectedDeviceId(d.id)}
                                  />
                                  <div>
                                    <div className="text-sm font-semibold">{d.name || "Без имени"}</div>
                                    <div className="text-xs text-muted-foreground font-mono">
                                      {d.id}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center justify-end gap-2 text-xs">
                                    <Dot online={d.state === "online"} />
                                    <span>{d.state === "online" ? "online" : "offline"}</span>
                                  </div>
                                  <div className="text-[11px] text-muted-foreground mt-1">
                                    type: {d.type || "—"}
                                  </div>
                                </div>
                              </label>
                            ))
                          : null}
                      </div>
                    </Field>
                  </div>
                </Card>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <Button variant="ghost" onClick={goBack}>
                    <ChevronLeft className="h-4 w-4" /> Назад
                  </Button>
                  <Button onClick={goNext} disabled={!canGoStep2}>
                    Далее <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </StepShell>
            </motion.div>
          ) : null}

          {step === 3 ? (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <StepShell
                title="Экран 3 — Настройка алерта"
                subtitle="Цвета, режим и длительность. Можно отправить тестовый алерт сразу." 
              >
                <div className="grid gap-6">
                  <Card>
                    <CardHeader
                      icon={Timer}
                      title="Цвета"
                      subtitle="Одноцветный или радуга (мигание между 2 цветами)"
                    />
                    <Divider />
                    <div className="p-5 sm:p-6 space-y-6">
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant={alertMode === "single" ? "primary" : "secondary"}
                          onClick={() => setAlertMode("single")}
                        >
                          Одноцветный
                        </Button>
                        <Button
                          variant={alertMode === "rainbow" ? "primary" : "secondary"}
                          onClick={() => setAlertMode("rainbow")}
                        >
                          Радужный
                        </Button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <Field
                          label="Цвет 1"
                          hint="HEX: #RRGGBB"
                          error={color1 && !color1Ok ? "Неверный HEX" : ""}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={normalizeHex(color1) || "#000000"}
                              onChange={(e) => setColor1(e.target.value)}
                              className="h-11 w-11 rounded-2xl border overflow-hidden"
                              aria-label="Color 1"
                            />
                            <Input
                              value={color1}
                              onChange={(e) => setColor1(e.target.value)}
                              placeholder="#FF0000"
                            />
                          </div>
                          <div className="mt-3">
                            <Palette value={color1} onPick={(c) => setColor1(c)} />
                          </div>
                        </Field>

                        {alertMode === "rainbow" ? (
                          <Field
                            label="Цвет 2"
                            hint="HEX: #RRGGBB"
                            error={color2 && !color2Ok ? "Неверный HEX" : ""}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={normalizeHex(color2) || "#000000"}
                                onChange={(e) => setColor2(e.target.value)}
                                className="h-11 w-11 rounded-2xl border overflow-hidden"
                                aria-label="Color 2"
                              />
                              <Input
                                value={color2}
                                onChange={(e) => setColor2(e.target.value)}
                                placeholder="#E30306"
                              />
                            </div>
                            <div className="mt-3">
                              <Palette value={color2} onPick={(c) => setColor2(c)} />
                            </div>
                          </Field>
                        ) : (
                          <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                            Второй цвет скрыт в одноцветном режиме.
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <CardHeader
                      icon={Timer}
                      title="Параметры"
                      subtitle="Время уведомления и интервал мигания (если радуга)"
                    />
                    <Divider />
                    <div className="p-5 sm:p-6 space-y-6">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <Field label="Время уведомления" hint="секунды">
                          <Input
                            type="number"
                            min={1}
                            step={1}
                            value={durationSec}
                            onChange={(e) => setDurationSec(Number(e.target.value))}
                            placeholder="10"
                          />
                        </Field>

                        {alertMode === "rainbow" ? (
                          <Field label="Интервал мигания" hint="секунды">
                            <Input
                              type="number"
                              min={0.1}
                              step={0.1}
                              value={blinkInterval}
                              onChange={(e) => setBlinkInterval(Number(e.target.value))}
                              placeholder="0.5"
                            />
                          </Field>
                        ) : (
                          <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                            Интервал мигания доступен только для радужного режима.
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <CardHeader
                      icon={ShieldCheck}
                      title="Предпросмотр / тест"
                      subtitle="Запусти тестовый алерт и проверь, что лампа отвечает"
                    />
                    <Divider />
                    <div className="p-5 sm:p-6 space-y-4">
                      <div className="rounded-3xl border p-4">
                        <div className="text-sm font-semibold">Предпросмотр</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Подсказка: если mismatch color_model — проверь поддержку RGB/HSV.
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <motion.div
                            className="h-12 w-12 rounded-3xl border shadow-sm"
                            animate={{ backgroundColor: normalizeHex(color1) || "#000000" }}
                            transition={{ duration: 0.2 }}
                          />
                          {alertMode === "rainbow" ? (
                            <motion.div
                              className="h-12 w-12 rounded-3xl border shadow-sm"
                              animate={{ backgroundColor: normalizeHex(color2) || "#000000" }}
                              transition={{ duration: 0.2 }}
                            />
                          ) : null}
                          <div className="text-xs text-muted-foreground">
                            {normalizeHex(color1) || color1}
                            {alertMode === "rainbow" ? ` / ${normalizeHex(color2) || color2}` : ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button onClick={runTest} disabled={!canFinish || testLoading}>
                          {testLoading ? "Запускаем..." : "Запустить тест"}
                        </Button>
                        <Button variant="secondary" onClick={saveAlertSettings} disabled={!canFinish || settingsSaving}>
                          {settingsSaving ? "Сохраняем..." : "Сохранить настройки"}
                        </Button>
                        {settingsMessage ? (
                          <span className="text-xs text-muted-foreground">{settingsMessage}</span>
                        ) : null}
                      </div>

                      <div className="rounded-2xl border bg-black/5 p-3 text-xs text-muted-foreground min-h-[48px] whitespace-pre-line">
                        {testLog.length ? testLog.join("\n") : "Лог теста появится здесь."}
                      </div>

                      {!canFinish ? (
                        <div className="text-xs text-red-600">
                          Проверь: выбрано устройство, HEX корректный, duration &gt; 0.
                        </div>
                      ) : null}
                    </div>
                  </Card>

                  <Card>
                    <CardHeader
                      icon={ShieldCheck}
                      title="Сводка конфигурации"
                      subtitle="То, что уйдёт на бекенд и/или в config.yaml"
                    />
                    <Divider />
                    <div className="p-5 sm:p-6">
                      <div className="grid gap-3 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-black/60">Yandex token</div>
                          <div className="font-mono">{summary.tokens.yandex || "—"}</div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-black/60">Telegram token</div>
                          <div className="font-mono">{summary.tokens.telegram || "—"}</div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-black/60">ngrok token</div>
                          <div className="font-mono">{summary.tokens.ngrok || "—"}</div>
                        </div>
                        <Divider />
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-black/60">Device</div>
                          <div className="text-right">
                            {summary.device ? (
                              <div className="space-y-1">
                                <div className="font-medium">{summary.device.name}</div>
                                <div className="text-xs text-muted-foreground font-mono">
                                  {summary.device.id}
                                </div>
                              </div>
                            ) : (
                              "—"
                            )}
                          </div>
                        </div>
                        <Divider />
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-black/60">Colors</div>
                          <div className="font-mono">
                            {summary.display.color1}
                            {alertMode === "rainbow" ? ` / ${summary.display.color2}` : ""}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-black/60">Duration</div>
                          <div className="font-mono">{summary.display.durationSec}s</div>
                        </div>
                        {alertMode === "rainbow" ? (
                          <div className="flex items-center justify-between gap-4">
                            <div className="text-black/60">Blink interval</div>
                            <div className="font-mono">{summary.display.blinkInterval}s</div>
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button variant="ghost" onClick={goBack}>
                          <ChevronLeft className="h-4 w-4" /> Назад
                        </Button>
                        <Button
                          disabled={!canFinish}
                          onClick={() => {
                            setStep(1);
                            resetDeviceState();
                          }}
                        >
                          Сначала
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </StepShell>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="max-w-2xl mx-auto mt-10 text-xs text-muted-foreground">
          <div className="rounded-3xl border bg-white p-4">
            <div className="font-medium text-black">Подключение фронта к бекенду</div>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                Укажи адрес API через <span className="font-mono">VITE_API_URL</span> (например,
                <span className="font-mono"> http://localhost:8000</span>).
              </li>
              <li>Токены сохраняются через <span className="font-mono">POST /setup/credentials</span>.</li>
              <li>Проверка токенов идёт через <span className="font-mono">POST /setup/verify</span>.</li>
              <li>
                Устройства подтягиваются из <span className="font-mono">GET /setup/devices</span>.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
