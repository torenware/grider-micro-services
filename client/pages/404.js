
export default function Custom404() {
  return (
    <div className='error'>
      <div className='container'>
        <h1>404 - Page Not Found</h1>
      </div>
    </div>
  );


}

export async function getStaticProps(context) {
  return {
    props: {
      noLinks: true
    }
  }

}


