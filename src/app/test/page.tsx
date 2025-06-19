export default function TestPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>TEST PAGE WORKS!</h1>
      <p>If you can see this, deployments are working.</p>
      <p>Current time: {new Date().toISOString()}</p>
    </div>
  );
}
