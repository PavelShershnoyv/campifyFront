import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from '../Header/Header';
import styles from './PreferencesSurveyPage.module.scss';

const PreferencesSurveyPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useSelector(state => state.user);
  
  // Состояния для ответов на вопросы
  const [answers, setAnswers] = useState({
    experienceLevel: '',
    activities: [],
    tripDuration: '',
    comfortLevel: '',
    locations: [],
    travelCompanions: '',
    season: '',
    tripPurpose: '',
    equipmentRental: [],
    physicalActivity: ''
  });
  
  // Состояние для отслеживания текущего вопроса
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Массив вопросов
  const questions = [
    {
      id: 'experienceLevel',
      question: 'Какой у вас опыт походов?',
      type: 'radio',
      options: [
        { value: 'beginner', label: 'Новичок (первый раз)' },
        { value: 'camping', label: 'Был в кемпингах, но не в диких походах' },
        { value: 'occasional', label: 'Хожу в походы 1–2 раза в год' },
        { value: 'experienced', label: 'Регулярно участвую в экспедициях' }
      ]
    },
    {
      id: 'activities',
      question: 'Какие активности вам интересны?',
      type: 'checkbox',
      options: [
        { value: 'hiking', label: 'Пешие прогулки' },
        { value: 'kayaking', label: 'Сплав на байдарках/SUP' },
        { value: 'photography', label: 'Фотоохота за пейзажами' },
        { value: 'caving', label: 'Исследование пещер' },
        { value: 'yoga', label: 'Йога/медитация' }
      ]
    },
    {
      id: 'tripDuration',
      question: 'На сколько дней планируете поход?',
      type: 'radio',
      options: [
        { value: 'oneday', label: '1 день' },
        { value: 'shorttrip', label: '2–3 дня' },
        { value: 'mediumtrip', label: '4–7 дней' },
        { value: 'longtrip', label: 'Более недели' }
      ]
    },
    {
      id: 'comfortLevel',
      question: 'Какой уровень комфорта предпочитаете?',
      type: 'radio',
      options: [
        { value: 'cartent', label: 'Палатка у машины' },
        { value: 'wildcamping', label: 'Дикий кемпинг (без удобств)' },
        { value: 'glamping', label: 'Глэмпинг (удобства, электричество)' },
        { value: 'cabin', label: 'Хочу спать в хижине/избушке' }
      ]
    },
    {
      id: 'locations',
      question: 'Какие локации вас привлекают?',
      type: 'checkbox',
      options: [
        { value: 'mountains', label: 'Горы и скалы' },
        { value: 'lakes', label: 'Озёра и реки' },
        { value: 'forest', label: 'Лес и тайга' },
        { value: 'historical', label: 'Исторические места (заброшки, петроглифы)' },
        { value: 'hidden', label: 'Малоизвестные тропы' }
      ]
    },
    {
      id: 'travelCompanions',
      question: 'С кем вы путешествуете?',
      type: 'radio',
      options: [
        { value: 'friends', label: 'Один/с друзьями' },
        { value: 'children', label: 'С детьми' },
        { value: 'dog', label: 'С собакой' },
        { value: 'guide', label: 'В группе с гидом' }
      ]
    },
    {
      id: 'season',
      question: 'Какой сезон вас интересует?',
      type: 'radio',
      options: [
        { value: 'summer', label: 'Лето' },
        { value: 'autumn', label: 'Осень' },
        { value: 'winter', label: 'Зима' },
        { value: 'spring', label: 'Весна' }
      ]
    },
    {
      id: 'tripPurpose',
      question: 'Что для вас главное в походе?',
      type: 'radio',
      options: [
        { value: 'adrenaline', label: 'Адреналин и вызов' },
        { value: 'nature', label: 'Единение с природой' },
        { value: 'culture', label: 'Культурные впечатления' },
        { value: 'relaxation', label: 'Отдых для души' }
      ]
    },
    {
      id: 'equipmentRental',
      question: 'Нужна ли вам аренда снаряжения?',
      type: 'checkbox',
      options: [
        { value: 'tent', label: 'Палатка/спальник' },
        { value: 'stove', label: 'Газовая горелка' },
        { value: 'transport', label: 'Транспорт (байдарка, велосипед)' },
        { value: 'none', label: 'Не нужно' }
      ]
    },
    {
      id: 'physicalActivity',
      question: 'Как относитесь к физическим нагрузкам?',
      type: 'radio',
      options: [
        { value: 'light', label: 'Лёгкие прогулки (до 5 км/день)' },
        { value: 'moderate', label: 'Умеренные (10–15 км/день)' },
        { value: 'intense', label: 'Максимальные (20+ км/день)' },
        { value: 'transport', label: 'Только на транспорте' }
      ]
    }
  ];
  
  // Обработчик изменения ответов для радиокнопок
  const handleRadioChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };
  
  // Обработчик изменения ответов для чекбоксов
  const handleCheckboxChange = (questionId, value) => {
    const currentValues = answers[questionId] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    
    setAnswers({
      ...answers,
      [questionId]: newValues
    });
  };
  
  // Обработчик для перехода к следующему вопросу
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };
  
  // Обработчик для возврата к предыдущему вопросу
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  // Отправка ответов на сервер
  const handleSubmit = () => {
    console.log('Отправляем ответы:', answers);
    // TODO: Здесь должен быть код для отправки ответов на сервер
    
    // После успешной отправки перенаправляем на страницу рекомендаций
    alert('Ваши предпочтения сохранены! Теперь мы сможем рекомендовать вам более подходящие маршруты.');
    navigate('/recommendations');
  };
  
  // Текущий вопрос
  const currentQuestionData = questions[currentQuestion];
  
  // Проверка, можно ли перейти к следующему вопросу
  const canProceed = () => {
    const question = questions[currentQuestion];
    
    if (question.type === 'checkbox') {
      // Для чекбоксов можно двигаться дальше даже без выбора
      return true;
    } else if (question.type === 'boolean' || question.type === 'radio') {
      // Для радиокнопок и булевых значений должен быть хотя бы один выбор
      return answers[question.id] !== undefined && answers[question.id] !== '';
    }
    
    return false;
  };
  
  // Функция для отображения текущего вопроса
  const renderQuestion = () => {
    const question = questions[currentQuestion];
    
    return (
      <div className={styles.questionContainer}>
        <h2 className={styles.questionTitle}>{question.question}</h2>
        
        {question.type === 'checkbox' && (
          <div className={styles.checkboxList}>
            {question.options.map(option => (
              <label key={option.value} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={answers[question.id]?.includes(option.value) || false}
                  onChange={() => handleCheckboxChange(question.id, option.value)}
                />
                <span className={styles.checkboxText}>{option.label}</span>
              </label>
            ))}
          </div>
        )}
        
        {(question.type === 'radio' || question.type === 'boolean') && (
          <div className={styles.radioList}>
            {question.options.map(option => (
              <label key={option.value} className={styles.radioItem}>
                <input
                  type="radio"
                  name={question.id}
                  checked={answers[question.id] === option.value}
                  onChange={() => handleRadioChange(question.id, option.value)}
                />
                <span className={styles.radioText}>{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.container}>
        <div className={styles.surveyCard}>
          <h1 className={styles.title}>Опрос предпочтений</h1>
          <p className={styles.description}>
            Ответьте на несколько вопросов, чтобы мы могли рекомендовать вам маршруты,
            которые лучше всего соответствуют вашим интересам.
          </p>
          
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${(currentQuestion / (questions.length - 1)) * 100}%` }}
            ></div>
          </div>
          
          <div className={styles.questionNumber}>
            Вопрос {currentQuestion + 1} из {questions.length}
          </div>
          
          {renderQuestion()}
          
          <div className={styles.buttonGroup}>
            <button 
              className={`${styles.button} ${styles.backButton}`} 
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
            >
              Назад
            </button>
            
            <button 
              className={`${styles.button} ${styles.nextButton}`} 
              onClick={handleNextQuestion}
              disabled={!canProceed()}
            >
              {currentQuestion === questions.length - 1 ? 'Завершить' : 'Далее'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSurveyPage; 