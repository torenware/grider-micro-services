import { useState } from 'react';
import axios from 'axios';

const component = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);

  return <form onSubmit={async evt => {
    evt.preventDefault();
    try {
      const response = await axios.post('/api/users/signup', {
        email,
        password
      });

      console.log(response.data);
    }
    catch (err) {
      console.log('Error:', err.response.data);
      setErrors(err.response.data.errors);
    }
  }}>
    <>
      <h1>Signup</h1>
      <div className='form-group'>
        <label>Email Address</label>
        <input value={email} onChange={evt => setEmail(evt.target.value)} className='form-control' />
      </div>
      <div className='form-group'>
        <label>Password</label>
        <input value={password} onChange={evt => setPassword(evt.target.value)} className='form-control' type='password' />
      </div>
      {errors.length > 0 && <div className='alert alert-danger'>
        <h4>There were errors</h4>
        <ul>
          {errors.map(err => {
            return <li key={err.field || err.message}>{err.message}</li>
          })
          }

        </ul>
      </div>

      }
      <button className="btn btn-primary">Signup</button>
    </>
  </form>
}

export default component;
