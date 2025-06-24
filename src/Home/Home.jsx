import React, { lazy, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { AppBar } from '@mui/material';
import { fetchDashboardData } from '../reducers/dashboardhome';
import CustomScaleLoader from '../ui/CustomScaleLoader';
import PreLogin from '../Layout/PreLogin';

const Dashboard = lazy(() => import('./Dashboard'));
const InfoBanner = lazy(() => import('./InfoBanner'));
const TeamPage = lazy(() => import('./TeamPage'));
const RotatingCarousel = lazy(() => import('./RotatingCarousel'));
const TestimonialsV = lazy(() => import('./TestimonialsV'));
const CourseQuerySection = lazy(() => import('./CourseQuerySection'));
const Collaboration = lazy(() => import('./Collaboration'));
const BannerPage = lazy(() => import('./BannerPage'));
const Footer = lazy(() => import('./Footer'));
const Dhanekula = lazy(() => import('./Dhanekula'));

export default function Home() {
  const dispatch = useDispatch();
  const { dashboardData, loading } = useSelector(state => state.dashboard);

  useEffect(() => {
    // Check if dashboardData is empty by inspecting its properties
    const isDataEmpty =
      Object.keys(dashboardData.companiesList).length === 0 &&
      Object.keys(dashboardData.collegesList).length === 0 &&
      Object.keys(dashboardData.yearOFPlacement).length === 0;

    if (isDataEmpty) {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, dashboardData]); // Include dashboardData in dependencies

  // Show loader while data is being fetched
  // if (loading) {
  //   return <CustomScaleLoader />;
  // }

  // Render Home component once data is fetched
  return (
    <div className="">
      <PreLogin />
      <a
        href="https://codegnan.com/job-accelerator-program/"
        target="accelerate-program"
        className="anchor-app-bar "
      >
        <AppBar
          sx={{
            backgroundColor: '#132EE0',
            transition: 'top 0.3s',
            textDecoration: 'none',
            boxShadow: 'none',
            border: 'none',
          }}
          className="scroll-container "
          position="static"
        >
          <p className="home-scroll-text mt-16 p-2 ">
            <span className="home-new">New</span>" Codegnan's Job Accelerator
            Program (JAP) offers a
            <span className="home-100-days"> 100-days</span> intensive training
            "
            <FontAwesomeIcon icon={faArrowRight} className="home-arrow" />
          </p>
        </AppBar>
      </a>
      <BannerPage />
      <InfoBanner />
      <TestimonialsV />
      <RotatingCarousel />
      <Dhanekula />
      <Dashboard />
      <CourseQuerySection />
      <Collaboration />
      <TeamPage />
      <Footer />
    </div>
  );
}
