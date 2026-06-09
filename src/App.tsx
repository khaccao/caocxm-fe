import * as React from 'react';

import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import "@/common/featureTextRich.css";
import "@/common/ckcontent.css";
import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

// import 'dhtmlx-gantt/codebase/skins/dhtmlxgantt_material.css';
import { AuthProvider, ReduxStoreProvider } from './components';
import { AppRouter } from './routes';
import ThemeCustomization from './themes';
import { EButtonState } from '@/common/define';
import './translations';

function App() {
  React.useEffect(() => {
    // Reset all button state keys to 'false' when app loads/reloads
    sessionStorage.setItem(EButtonState.KeHoachTamUng12, 'false');
    sessionStorage.setItem(EButtonState.KeHoachTamUng27, 'false');
    sessionStorage.setItem(EButtonState.KeHoachThanhToan05, 'false');
    sessionStorage.setItem(EButtonState.KeHoachThanhToan20, 'false');
  }, []);

  return (
    <ReduxStoreProvider>
      <ThemeCustomization>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ThemeCustomization>
    </ReduxStoreProvider>
  );
}

export default App;
