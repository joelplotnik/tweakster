import React, { useState, useEffect } from 'react';
import { useRouteLoaderData, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { API_URL } from '../../constants/constants';
import Pagination from '../../components/UI/Buttons/Pagination';

import classes from './ReportsPage.module.css';

const ReportsPage = () => {
  const token = useRouteLoaderData('root');
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    if (pageParam) {
      setCurrentPage(parseInt(pageParam));
    }
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`${API_URL}/reports?page=${currentPage}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        const { reports: data, total_pages: totalPages } =
          await response.json();

        setReports(data);
        setTotalPages(totalPages);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, [token, currentPage]);

  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get('page');
      if (pageParam) {
        setCurrentPage(parseInt(pageParam));
      } else {
        setCurrentPage(1);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.history.pushState(null, '', `?page=${page}`);
  };

  const handleDeleteReport = async (reportId) => {
    try {
      const response = await fetch(`${API_URL}/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      setReports(
        reports.map((report) => {
          if (report.report.id === reportId) {
            return { ...report, deleted: true };
          }
          return report;
        })
      );
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Error deleting report');
    }
  };

  return (
    <div className={classes['reports-container']}>
      <h2>Reports</h2>
      <table className={classes['report-table']}>
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Reporter</th>
            <th>Type</th>
            <th>Reason</th>
            <th>URL</th>
            <th>Details</th>
            <th>Content</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, index) => (
            <tr
              key={index}
              className={report.deleted ? classes['deleted-row'] : ''}
            >
              <td>{report.report.id}</td>
              <td>{report.reporter.username}</td>
              <td>{report.report.content_type}</td>
              <td>{report.report.reason}</td>
              <td>{report.creator.username}</td>
              <td>
                {report.report.content_type === 'piece' && (
                  <>Title: {report.piece.title}</>
                )}
                {report.report.content_type === 'comment' && (
                  <>Comment: {report.comment.message}</>
                )}
                {report.report.content_type === 'channel' && (
                  <>Name: {report.channel.name}</>
                )}
                {report.report.content_type === 'user' && (
                  <>Username: {report.creator.username}</>
                )}
              </td>
              <td>
                {report.report.content_type === 'piece' && (
                  <Link
                    to={`/channels/${report.channel.id}/pieces/${report.piece.id}`}
                    className={classes.link}
                  >
                    View Content
                  </Link>
                )}
                {report.report.content_type === 'comment' && (
                  <Link
                    to={`/channels/${report.channel.id}/pieces/${report.piece.id}`}
                    className={classes.link}
                  >
                    View Content
                  </Link>
                )}
                {report.report.content_type === 'channel' && (
                  <Link
                    to={`/channels/${report.channel.id}`}
                    className={classes.link}
                  >
                    View Content
                  </Link>
                )}
                {report.report.content_type === 'user' && (
                  <Link
                    to={`/users/${report.creator.id}`}
                    className={classes.link}
                  >
                    View Content
                  </Link>
                )}
              </td>
              <td>
                <button
                  className={classes['delete-button']}
                  onClick={() => handleDeleteReport(report.report.id)}
                  disabled={report.deleted}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ReportsPage;
