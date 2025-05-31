import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAccount } from "wagmi";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import MyServices from "./pages/MyServices";
import Explore from "./pages/Explore";
import Details from "./pages/Details";
import Chat from "./pages/Chat";
import Comments from "./pages/Comments";
import Register from "./pages/Register";
import ViewProfile from "./pages/ViewProfile";

function App() {
    const { isConnected } = useAccount();

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/profile"
                    element={
                        isConnected ? <Profile /> : <Navigate to="/" replace />
                    }
                />
                <Route
                    path="/profile/:address"
                    element={<ViewProfile />}
                />
                <Route
                    path="/register"
                    element={
                        isConnected ? <Register /> : <Navigate to="/" replace />
                    }
                />
                <Route
                    path="/my-services/:address"
                    element={
                        isConnected ? (
                            <MyServices />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    }
                />
                <Route path="/explore" element={<Explore />} />
                <Route path="/service/:id" element={<Details />} />
                <Route
                    path="/chat"
                    element={
                        isConnected ? <Chat /> : <Navigate to="/" replace />
                    }
                />
                <Route path="/comments" element={<Comments />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
