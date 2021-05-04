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
      if (!err.response) {
        // Weird case
        console.log(err);
        setErrors(
          <div className="alert alert-danger">
            <h4>Internal Error</h4>
            <pre>
              {JSON.stringify(err)}
            </pre>
          </div>
        );
        return;
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
    }
  };

  return { doRequest, errors };
};

export default useRequest;