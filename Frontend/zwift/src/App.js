import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import HomePage from './Pages/HomePage';

const theme = createTheme({
  // You can customize the theme here if you need to
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* This resets CSS and uses the theme's typography settings */}
      <HomePage/>
    </ThemeProvider>
  );
}

export default App;
