import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import NotFoundPage from "./NotFoundPage";
import articles from "./article-content";
import axios from "axios";
import AddCommentForm from "../components/AddCommentForm";
import CommentsList from "../components/CommentsList";
import useUser from "../hooks/useUser";


const ArticlePage = () => {

    const [articleInfo, setArticleInfo] = useState({upvotes:0, comments:[], canUpvote: false});
    const { canUpvote } = articleInfo;
    const { articleId } = useParams(); //object containing all url vars as keys

    const {user, isLoading} = useUser();
    const navigate = useNavigate();

    useEffect(()=>{
        const loadArticleInfo = async () => {
            const token =  user && await user.getIdToken();
            const headers = token ? {authtoken: token} : {};
            const response = await axios.get(`/api/articles/${articleId}`,{headers});
            const newArticleInfo = response.data;
            setArticleInfo(newArticleInfo) ;
        }

        if (!isLoading) {
            loadArticleInfo();
        }

    }, [isLoading, user])



    const article = articles.find(article => article.name === articleId);


    const addUpvote = async () => {
        const token =  user && await user.getIdToken();
        const headers = token ? {authtoken: token} : {};
        const response = await axios.put(`/api/articles/${articleId}/upvote`, null, {headers});
        const updatedArticle = response.data;
        setArticleInfo(updatedArticle);
    }

    if (!article) {
        return <NotFoundPage/>
    }

    return (
        <>
        <div className="upvotes-section">
            {user
                ? <button onClick={addUpvote}>{canUpvote ? "Upvote" : "Already upvoted"}</button>
                : <button onClick={()=>{
                    navigate('/login');
                }}>Login to add an upvote</button>}
            <p className="upvotes-count">{articleInfo.upvotes} upvotes</p>
        </div>
        <h1 className="article-title">{article.title}</h1>
        {article.content.map((paragraph, i) => (
            <p key={i} >{paragraph}</p>
        ))}
        {user
            ? <AddCommentForm 
                articleName={articleId}
                onArticleUpdated={updatedArticle => setArticleInfo(updatedArticle)}/>
            : <button onClick={()=>{
                navigate('/login');
            }}>Login to add a comment</button>}
        <CommentsList comments={articleInfo.comments}/>
        </>
    );
}

export default ArticlePage;