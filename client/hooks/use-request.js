import axios from 'axios';
import { useState } from 'react';

const useRequest = ({ url, method, body, onSuccess = null }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (bodyParams = {}) => {
    try {
      setErrors(null);
      const mergedBody = {
        ...body,
        ...bodyParams
      };
      const response = await axios[method](url, mergedBody);
      if (onSuccess) {
        await onSuccess(response.data);
      }
      return response.data;
    } catch (err) {
      if (!err.response || !err.response.data) {
        // Weird case
        console.log(err);
        setErrors(
          <div className="alert alert-danger">
            <h4>Internal Error</h4>
            <pre>
              {err}
            </pre>
          </div>
        );
        console.error(err.toString());
        return;
      }
      try {
        if (typeof err.response.data.errors === 'undefined') {
          console.error('parent err: ', err.response.data);
        }
      }
      catch (oddErr) {
        console.error('even typeof test failed :-(');

      }
      setErrors(
        <div className="alert alert-danger">
          <h4>Ooops....</h4>
          <ul className="my-0">
            {err.response.data.errors.map(err => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      );
      console.error(err);
    }
  };

  return { doRequest, errors };
};

export default useRequest;