
import { useLocation } from 'react-router-dom';
import ArticleEditor from './ArticleEditor';

const ArticleEditorRoute = () => {
  const location = useLocation();
  const { title, content } = location.state || {};

  // Pass the title and content to the ArticleEditor if provided
  return <ArticleEditor initialTitle={title} initialContent={content} />;
};

export default ArticleEditorRoute;
