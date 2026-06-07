import AppRouter from "./routes/AppRouter";
import { ThemeModeProvider } from "../metronic/app/partials/layout/theme-mode/ThemeModeProvider";
import { ConfigProvider, theme as antdTheme, App as AntdApp } from "antd";
import { useTheme } from "@/hooks/useTheme";
import { isDarkMode } from "@/app/slices/uiSlice";
import { useAntdLocale } from "@/hooks/useAntdLocale";

function AppContent() {
  const { theme } = useTheme();
  const isDark = isDarkMode(theme);
  const antdLocale = useAntdLocale();

  return (
    <ConfigProvider
      locale={antdLocale}
      key={isDark ? "dark" : "light"}
      theme={{
        algorithm: isDark
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
        token: {
          fontFamily: 'Inter, Helvetica, "sans-serif"',
        },
        components: {
          Form: {
            itemMarginBottom: 0,
          },
        },
      }}
    >
      <AntdApp>
        <AppRouter />
      </AntdApp>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeModeProvider>
      <AppContent />
    </ThemeModeProvider>
  );
}

export default App;
