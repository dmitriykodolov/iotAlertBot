import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Lamp,
  Link,
  RefreshCcw,
  ShieldCheck,
  Timer,
  Webhook,
} from "lucide-react";

// Интерактивный макет (wizard) для 3 экранов.
// Без привязки к реальному бекенду: есть заглушка fetchDevices().
// Можно заменить на реальные вызовы API, когда бек будет готов.

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

// В реале: GET {{host}}/v1.0/user/info -> фильтруем devices.types.light*
// Потом для каждого id: GET {{host}}/v1.0/devices/{id} и берём status/state
async function fetchDevicesMock() {
  await new Promise((r) => setTimeout(r, 650));
  return [
    {
      id: "d8d98163-8401-41e7-9c19-4bc1ed735db1",
      name: "Лампочка",
      type: "devices.types.light",
      state: "online",
      status: "ok",
    },
    {
      id: "57171013-bc37-4ab0-b8b9-5d7c69e0327a",
      name: "Подсветка",
      type: "devices.types.light.strip",
      state: "offline",
      status: "ok",
    },
    {
      id: "x-ignored-nonlight",
      name: "Пылесос (не показывать)",
      type: "devices.types.vacuum_cleaner",
      state: "online",
      status: "ok",
    },
    {
      id: "y-ignored-badstatus",
      name: "Лампа (ошибка статуса)",
      type: "devices.types.light",
      state: "online",
      status: "error",
    },
  ]
    .filter((d) => d.type.startsWith("devices.types.light"))
    .filter((d) => d.status === "ok");
}

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

export default function IoTAlertUIMock() {
  const [step, setStep] = useState(1);

  // Step 1
  const [yandexToken, setYandexToken] = useState("");
  const [telegramToken, setTelegramToken] = useState("");
  const [ngrokToken, setNgrokToken] = useState("");

  // Step 2
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [devicesError, setDevicesError] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  // Step 3
  const [color1, setColor1] = useState("#FF0000");
  const [color2, setColor2] = useState("#E30306");
  const [durationSec, setDurationSec] = useState(10);
  const [blinkInterval, setBlinkInterval] = useState(0.5);

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
    color2Ok &&
    Number.isFinite(durationSec) &&
    durationSec > 0 &&
    Number.isFinite(blinkInterval) &&
    blinkInterval > 0;

  const loadDevices = async () => {
    setLoadingDevices(true);
    setDevicesError("");
    try {
      // Здесь можно заменить на реальные вызовы:
      // - GET /v1.0/user/info
      // - фильтр по devices.types.light*
      // - GET /v1.0/devices/{id} и фильтр status==ok
      const list = await fetchDevicesMock();
      setDevices(list);
      if (!selectedDeviceId && list.length) setSelectedDeviceId(list[0].id);
    } catch (e) {
      setDevicesError("Не удалось получить список устройств");
    } finally {
      setLoadingDevices(false);
    }
  };

  const goNext = async () => {
    if (step === 1) {
      if (!canGoStep1) return;
      setStep(2);
      if (devices.length === 0) await loadDevices();
      return;
    }
    if (step === 2) {
      if (!canGoStep2) return;
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
                Макет фронта для настройки токенов, выбора лампы и параметров алерта
              </div>
            </div>
            <Badge>prototype</Badge>
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
                subtitle="Три токена — обязательные. В этом макете они сохраняются локально (в state)."
              >
                <Card>
                  <CardHeader
                    icon={ShieldCheck}
                    title="Данные доступа"
                    subtitle="Яндекс IoT OAuth, Telegram Bot Token, ngrok Token"
                  />
                  <Divider />
                  <div className="p-5 sm:p-6 space-y-5">
                    <Field
                      label="Token Яндекс (OAuth)"
                      hint="IOT_TOKEN"
                      error={tokenErrors.yandexToken}
                    >
                      <div className="relative">
                        <KeyRound className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                        <Input
                          value={yandexToken}
                          onChange={(e) => setYandexToken(e.target.value)}
                          placeholder="AQAAAA..."
                          className="pl-11"
                        />
                      </div>
                    </Field>

                    <Field
                      label="Token бота Telegram"
                      hint="TELEGRAM_BOT_TOKEN"
                      error={tokenErrors.telegramToken}
                    >
                      <div className="relative">
                        <Webhook className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                        <Input
                          value={telegramToken}
                          onChange={(e) => setTelegramToken(e.target.value)}
                          placeholder="123456:ABC-DEF..."
                          className="pl-11"
                        />
                      </div>
                    </Field>

                    <Field label="Token ngrok" hint="NGROK_AUTHTOKEN" error={tokenErrors.ngrokToken}>
                      <div className="relative">
                        <Link className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                        <Input
                          value={ngrokToken}
                          onChange={(e) => setNgrokToken(e.target.value)}
                          placeholder="2wG..."
                          className="pl-11"
                        />
                      </div>
                    </Field>
                  </div>
                </Card>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <Button variant="ghost" disabled>
                    <ChevronLeft className="h-4 w-4" /> Назад
                  </Button>
                  <Button onClick={goNext} disabled={!canGoStep1}>
                    Далее <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 text-xs text-muted-foreground">
                  Совет: позже можно добавить опцию “Сохранить токены в .env” и кнопку “Проверить доступы”.
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
                subtitle='Показываем только освещение: type начинается с "devices.types.light". Берём статус из /devices/{id} и допускаем только status="ok".'
              >
                <Card>
                  <CardHeader
                    icon={Lamp}
                    title="Доступные устройства освещения"
                    subtitle="В этом макете используется заглушка. Кнопка “Обновить” имитирует запросы к API."
                    right={
                      <Button
                        variant="secondary"
                        onClick={loadDevices}
                        disabled={loadingDevices}
                        className="whitespace-nowrap"
                      >
                        <RefreshCcw className={"h-4 w-4 " + (loadingDevices ? "animate-spin" : "")} />
                        Обновить
                      </Button>
                    }
                  />
                  <Divider />
                  <div className="p-5 sm:p-6 space-y-4">
                    {devicesError ? (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {devicesError}
                      </div>
                    ) : null}

                    <Field label="Выберите устройство" hint="id + name + индикатор online/offline">
                      <div className="rounded-2xl border p-2">
                        <select
                          className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                          value={selectedDeviceId}
                          onChange={(e) => setSelectedDeviceId(e.target.value)}
                          disabled={loadingDevices || devices.length === 0}
                        >
                          {devices.length === 0 ? (
                            <option value="">Нет доступных устройств</option>
                          ) : null}
                          {devices.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} — {d.id}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Field>

                    {selectedDevice ? (
                      <div className="rounded-3xl bg-black/5 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{selectedDevice.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{selectedDevice.id}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Dot online={selectedDevice.state === "online"} />
                            <div className="text-sm">
                              {selectedDevice.state === "online" ? "online" : "offline"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Выбери устройство из списка.</div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Под капотом: сначала /v1.0/user/info (фильтр по type), затем /v1.0/devices/{`{id}`} (фильтр по status).
                    </div>
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
                title="Экран 3 — Настройка отображения"
                subtitle="Два цвета (HEX + палитра), длительность уведомления и интервал мигания (для rainbow)."
              >
                <div className="grid gap-6">
                  <Card>
                    <CardHeader
                      icon={Timer}
                      title="Параметры алерта"
                      subtitle="Дальше это можно отправлять на /startAlert или /startAlertRainbow"
                    />
                    <Divider />
                    <div className="p-5 sm:p-6 space-y-6">
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
                      </div>

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

                        <Field label="Интервал мигания" hint="секунды (для rainbow)">
                          <Input
                            type="number"
                            min={0.1}
                            step={0.1}
                            value={blinkInterval}
                            onChange={(e) => setBlinkInterval(Number(e.target.value))}
                            placeholder="0.5"
                          />
                        </Field>
                      </div>

                      <div className="rounded-3xl border p-4">
                        <div className="text-sm font-semibold">Предпросмотр (условный)</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Это просто визуальный намёк: как будет “прыгать” между цветами.
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <motion.div
                            className="h-12 w-12 rounded-3xl border shadow-sm"
                            animate={{ backgroundColor: normalizeHex(color1) || "#000000" }}
                            transition={{ duration: 0.2 }}
                          />
                          <motion.div
                            className="h-12 w-12 rounded-3xl border shadow-sm"
                            animate={{ backgroundColor: normalizeHex(color2) || "#000000" }}
                            transition={{ duration: 0.2 }}
                          />
                          <div className="text-xs text-muted-foreground">
                            {normalizeHex(color1) || color1} ↔ {normalizeHex(color2) || color2}
                          </div>
                        </div>
                      </div>

                      {!canFinish ? (
                        <div className="text-xs text-red-600">
                          Проверь: выбрано устройство, HEX корректные, duration/interval &gt; 0.
                        </div>
                      ) : null}
                    </div>
                  </Card>

                  <Card>
                    <CardHeader
                      icon={ShieldCheck}
                      title="Сводка конфигурации"
                      subtitle="То, что в реале уйдёт на бекенд и/или в .env"
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
                                <div className="text-xs text-muted-foreground font-mono">{summary.device.id}</div>
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
                            {summary.display.color1} / {summary.display.color2}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-black/60">Duration</div>
                          <div className="font-mono">{summary.display.durationSec}s</div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-black/60">Blink interval</div>
                          <div className="font-mono">{summary.display.blinkInterval}s</div>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button variant="ghost" onClick={goBack}>
                          <ChevronLeft className="h-4 w-4" /> Назад
                        </Button>
                        <Button
                          disabled={!canFinish}
                          onClick={() => {
                            // В макете просто показываем alert.
                            // В реале: POST /startAlert или /startAlertRainbow
                            alert(
                              "Готово!\n\nДальше можно: \n- POST /startAlert (один цвет)\n- POST /startAlertRainbow (мигание)\n\nСмотри сводку ниже — это payload/env." 
                            );
                          }}
                        >
                          Применить (макет)
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setStep(1);
                          }}
                        >
                          С начала
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
            <div className="font-medium text-black">Как подключить к реальному бекенду</div>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                На шаге 2 заменишь <span className="font-mono">fetchDevicesMock()</span> на вызовы:
                <span className="font-mono"> GET /v1.0/user/info</span> → фильтр по <span className="font-mono">devices.types.light*</span> →
                <span className="font-mono"> GET /v1.0/devices/{`{id}`}</span>.
              </li>
              <li>
                На шаге 3 кнопку “Применить” можно связать с твоим сервисом:
                <span className="font-mono"> POST /startAlert</span> или <span className="font-mono">POST /startAlertRainbow</span>.
              </li>
              <li>
                Токены: можно держать в памяти фронта, или один раз отправить на бек (и хранить в .env/секретах).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
