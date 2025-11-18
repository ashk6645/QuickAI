import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import WriteArticle from "./pages/WriteArticle";
import BlogTitles from "./pages/BlogTitles";
import GenerateImages from "./pages/GenerateImages.jsx";
import RemoveBackground from "./pages/RemoveBackground.jsx";
import RemoveObject from "./pages/RemoveObject.jsx";
import ReviewResume from "./pages/ReviewResume.jsx";
import JobOpportunities from "./pages/JobOpportunities.jsx";
import Community from "./pages/Community.jsx";
import NotFound from "./pages/NotFound.jsx";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary.jsx";


const App = () => {

  return (
    <ErrorBoundary>
      <div>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ai" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="write-article" element={<WriteArticle />} />
            <Route path="blog-titles" element={<BlogTitles/>} />
            <Route path="generate-images" element={<GenerateImages/>} />
            <Route path="remove-background" element={<RemoveBackground/>} />
            <Route path="remove-object" element={<RemoveObject/>} />
            <Route path="review-resume" element={<ReviewResume/>} />
            <Route path="job-opportunities" element={<JobOpportunities/>} />
            <Route path="community" element={<Community/>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
};

export default App;
