import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import {
  TextField
} from "@material-ui/core";
import CircularProgress from '@material-ui/core/CircularProgress';
import { green } from '@material-ui/core/colors';
import FormGroup from '@material-ui/core/FormGroup';
import PropTypes from 'prop-types';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import CheckIcon from '@material-ui/icons/Check';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import EditIcon from '@material-ui/icons/Edit';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import MySnackbarContentWrapper from './../../../../pages/home/MySnackBar';
import Avatar from '@material-ui/core/Avatar';
import { connect} from "react-redux";
import * as actions from '../../../../actions';
import * as jobDuck from "../../../../store/ducks/job.duck";
import * as authDuck from "../../../../store/ducks/auth.duck";
import {useHistory , Link } from 'react-router-dom';
import default_img from './../../../../assets/default_profile.png';

import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import RateReviewIcon from '@material-ui/icons/RateReview';
import Rating from '@material-ui/lab/Rating';
import Box from '@material-ui/core/Box';

import urlserver from '../../../../../app/config/urlserver';

// console.log('hiiiii',TableBody);
function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const headRows = [
  { id: '_id', numeric: 'left', visibility:false,disablePadding: true, label: 'Id' },
  { id: 'title', numeric: 'center', visibility:true,disablePadding: false, label: 'title' },
  { id: 'category', numeric: 'center', visibility:true,disablePadding: false, label: 'Category' },
  { id: 'nurse', numeric: 'center', visibility:true,disablePadding: false, label: 'Nurse' },
  { id: 'status', numeric: 'center', visibility:true,disablePadding: false, label: 'Status' },
  { id: 'action', numeric: 'center', visibility:true,disablePadding: false, label: 'Actions' },
];



const mapStateToProps = (state) => ({
  jobs: state.job.jobs,
  user:state.auth.user,
  curjob:state.job.curjob
})
function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'Select all desserts' }}
          />
        </TableCell>
        {headRows.map((row,index) => (
         
          <TableCell
            key={row.id}
            align={row.numeric}
            padding={row.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === row.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === row.id}
              direction={order}
              onClick={createSortHandler(row.id)}
            >
              {row.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    paddingTop:'0px',
    marginTop:'0px'
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
}));

const EnhancedTableToolbar = props => {
  const classes = useToolbarStyles();
  const { numSelected,selected } = props;
  const [addsnack, setAddsnack] = React.useState(false);
  const [multiremove,setMutliremove] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingButtonStyle, setLoadingButtonStyle] = useState({
    paddingRight: "2.5rem"
  });
  const enableLoading = () => {
    setLoading(true);
    setLoadingButtonStyle({ paddingRight: "3.5rem" });
  };

  const disableLoading = () => {
    setLoading(false);
    setLoadingButtonStyle({ paddingRight: "2.5rem" });
  };
  function handleAddClick(){
    props.setCurJob({})

    // setAdd(true)
    
  }
  function handleMultiRemoveClick(){
    enableLoading();
    setTimeout(() => {
      actions.deleteJobs(selected)
        .then(res => {
          disableLoading();
          let {data} = res;
          //console.log('===  delete category  == ')
          //console.log(res)
          if(!data.success) {
          }
          else{
            props.handleunSelect();
            setMutliremove(true);
            handleMultiRemoveClose();
            props.allJobs(data.jobs);
          }
        })
        .catch(() => {
        });
    }, 1000);
  }
  function handleMultiRemoveClose() {
    setMutliremove(false);
  }
  function handleAddsnackClose() {
    setAddsnack(false);

  }
  function handleAddsnackClick(){
    setAddsnack(true)
  }


  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={classes.title}>
        {numSelected > 0 ? (
          <Typography color="inherit" variant="subtitle1">
            {numSelected} selected
          </Typography>
        ) : (
          <Typography variant="h6" id="tableTitle">
            Current Job
          </Typography>
        )}
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}>
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton aria-label="Delete" onClick={handleMultiRemoveClick}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="New Job">
            {/* <IconButton aria-label="AddCircleOutlineIcon" onClick={handleAddClick}>
              <AddCircleOutlineIcon />
            </IconButton> */}
             <Link to="/myprofile/create-edit-job"><IconButton aria-label="AddCircleOutlineIcon" onClick={handleAddClick}>
              <AddCircleOutlineIcon />
            </IconButton></Link>
          </Tooltip>
        )}
          <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={addsnack}
          autoHideDuration={6000}
          onClose={handleAddsnackClose}
        >
          <MySnackbarContentWrapper
            onClose={handleAddsnackClose}
            variant={"success"}
            message="Added Succesfully!"
          />
        </Snackbar>
      </div>
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  selected:PropTypes.array,
  allJobs:PropTypes.func,
  handleunSelect:PropTypes.func,
  setCurJob:PropTypes.func
};
const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(0),
  },
  paper: {
    width: '100%',
    marginTop: theme.spacing(0),

    // marginBottom: theme.spacing(2),
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  fabProgress: {
    color: green[500],
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  table: {
    minWidth: 750,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
}));


function CurrentWorking(props) {
  // const timer = React.useRef();
  const [paymentAmount, setPaymentAmount]= React.useState(0);
  const [paymentDescription, setPaymentDescription]= React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [reviewSubject, setReviewSubject]= React.useState('');
  const [reviewWrite, setReviewWrite]= React.useState('');
  const [reviewvalueResponsiveness, setValueResponsiveness] = React.useState(0);
  const [reviewvalueProfessionalism, setValueProfessionalism] = React.useState(0);
  const [reviewvalueValue, setValueValue] = React.useState(0);
  const [reviewvalueFlexibility, setValueFlexibility] = React.useState(0);
  const [reviewvalueBehaviour, setValueBehaviour] = React.useState(0);
  const classes = useStyles();
  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  });
  const [loadingButtonStyle, setLoadingButtonStyle] = useState({
    paddingRight: "2.5rem"
  });
  const enableLoading = () => {
    setLoading(true);
    setLoadingButtonStyle({ paddingRight: "3.5rem" });
  };
  const handlePaymentDescription = (event)=> {
    setPaymentDescription(event.target.value);
  }
  const handlePaymentAmount = (event)=>{
    setPaymentAmount(event.target.value);
  }
  const disableLoading = () => {
    setLoading(false);
    setLoadingButtonStyle({ paddingRight: "2.5rem" });
  };
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [remove, setRemove] = React.useState(false);
  const [removesnack, setRemovesnack] = React.useState(false);
  const [curid,setCurid]= React.useState("");
//   const [curdescription,setCurdescription]= React.useState("");
  const [allinfo,setAllinfo] = React.useState([]);
  const [dialogopen,setDialogOpen] = React.useState(false)
  const [dialogopenDollar,setDialogOpenDollar] = React.useState(false)
  const [reviewdialogopen,setReviewDialogOpen] = React.useState(false)
  const [completeinfo, setCompleteInfo] = React.useState({});
  const [state, setState] = React.useState({
    openState: false,
    vertical: 'bottom',
    horizontal: 'center',
    content:'successfully completed'
  });

  const history = useHistory();
  
  const { vertical, horizontal, openState,content } = state;
  function handleStateClose() {
    setState({ ...state, openState: false });
  }
  function handleApplyClick(row) {
    setDialogOpen(true);
    setCompleteInfo(row)
  }
  function handleDialogOpenDollar(row) {
    // alert('hii');
    setDialogOpenDollar(true);
    setCompleteInfo(row)
  }
  function handleApplyReviewClick(row) {
    console.log('handleAPplyReviewClick', row)
    setReviewDialogOpen(true);
    setCompleteInfo(row)
  }
  function handleReview(){
    if(reviewSubject === '' || reviewWrite === ''){
      alert('Please input Review Subject & Write')
      return;
    }
    if (!loading) {
      setSuccess(false);
      setLoading(true);
      setTimeout(() => {
        var tempData ={
          Responsiveness: reviewvalueResponsiveness,  
            Professionalism: reviewvalueProfessionalism,
            Value: reviewvalueValue,
            Flexibility: reviewvalueFlexibility,
            Behaviour: reviewvalueBehaviour,
            reviewSubject: reviewSubject,
            reviewWrite: reviewWrite,
            reviewOverallRating: (reviewvalueResponsiveness + reviewvalueProfessionalism +reviewvalueValue + reviewvalueFlexibility + reviewvalueBehaviour) / 5,
            fromNurse: null,
            fromClient:props.user._id,
            toNurse:completeinfo.nurse._id,
            toClient:null,
            job:completeinfo._id
        }
        actions.giveReview(tempData).then(res =>{
          let {data} = res;
          if(!data.success){
            alert('Error!!!')
          }else{
          props.allJobs(data.jobs);
          props.allReviews(data.reviews);

            alert('Successfully')

          }
          setSuccess(true);
          setLoading(false);
          setReviewDialogOpen(false);
        })
    

      }, 1000);
    }
  }
  function handleAward(){
    enableLoading();
    setTimeout(() => {
      actions.completeJob(completeinfo._id)
        .then(res => {
          disableLoading();
          let {data} = res;
          //console.log('===  delete category  == ')
          //console.log(res)
          if(!data.success) {
          }
          else{
            handleRemoveClose();
            setRemovesnack(true);
            props.allJobs();
          }
        })
        .catch(() => {
        });
    }, 1000);
  }
  function handleDollar(){
    if(paymentAmount === 0)
    return;
    var tempData = {
        _id:props.user._id,
        role:props.user.role,
        customer:props.user.customerSource.id,
        user:props.user,
        to:completeinfo.nurse,
        amount:paymentAmount,
    };

    console.log('tempDataaaa',tempData);
    // process.exit();

if (!loading) {
    setSuccess(false);
    setLoading(true);
setTimeout(() => {
        actions.paymentCharge(tempData).then(res=>{
        disableLoading();
        let {data} = res;
        if(!data.success){
        // setStatus(data.errMessage);
        return;
        }else{
        console.log('succesfull')
        props.getCharges(data.charges);
        setSuccess(true);
    setLoading(false);
    handleDialogDollarClose();
        // history.push("/myprofile/overview");
        return;
        }
        }).catch(() => {
    setLoading(false);
    // disableLoading();
            // (
            // 'ErrsetStatusor!!! you have to check your Database or Connection'
            // );
        });
}, 1000);}
  }
  function handleDialogClose() {
    setDialogOpen(false);
  }
  function handleDialogDollarClose() {
    setDialogOpenDollar(false);
  }
  function handleReviewDialogClose() {
    setReviewDialogOpen(false);
  }


  // function handleEditClick_byid(row_id){
  //   history.push('')
  // }
  // onClick={()=>handleEditClick_byid(row._id)}
  // function handleEditClick_byid(id){

  //   history.push(`/myprofile/bid-list/?d=${id}`);

  // };

  // console.log('propsprops00',props.user._id);

  async function getjobs(){
    await fetch(`${urlserver}getjob`,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: props.user._id
            })
          }
     ).then(res=>{
      // result.json().then((data)=>{
      //   setMessage(data.message)
         res.json().then(data_=>{
          setAllinfo(data_.jobs);
          // console.log('res', data_.jobs);
         })

        
     }) .catch(err => {
      console.log("error:", err);
    });
    
    }

  useEffect(() => {
    getjobs();
    // getJoblist();
 
    // var tempArr = props.jobs;
    // console.log('roooorrr',tempArr);
    // if(!tempArr)
    // {

    // tempArr = [];
    // tempArr = tempArr.filter(sub=>{
 
    //     if(!sub.client)
    //     {
    //         return false;
    //     }
    //   });

    // }

      // console.log('dddd',tempArr);
    // setAllinfo(tempArr);

  
  }, [props])

  // console.log('table ltoo-',allinfo);

  function handleEditClick(row){
    props.setCurJob(row)
  }
  function handleRemoveClose() {
    setRemove(false);
  }
  function handleRemoveClick(id){
    setRemove(true);
    setCurid(id);
  }
  function handleRemoveSnackClick(){
    enableLoading();
    setTimeout(() => {
      actions.deleteJob(curid)
        .then(res => {
          disableLoading();
          let {data} = res;
          //console.log('===  delete category  == ')
          //console.log(res)
          if(!data.success) {
          }
          else{
            handleRemoveClose();
            setRemovesnack(true);
            props.allJobs(data.jobs);
          }
        })
        .catch(() => {
        });
    }, 1000);
  }
  function handleRemoveSnackClose(){
    setRemovesnack(false);
  }
  function handleRequestSort(event, property) {
    const isDesc = orderBy === property && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(property);
  }

  function handleSelectAllClick(event) {
    if (event.target.checked) {
      const newSelecteds = allinfo.map(n => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }
  function handleunSelect(){
    setSelected([]);
  }

  function handleClick(event, name) {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  }

  function handleChangePage(event, newPage) {
    setPage(newPage);
  }

  function handleChangeRowsPerPage(event) {
    setRowsPerPage(+event.target.value);
  }
  function handleReviewSubject(event) {
    setReviewSubject(event.target.value);
  }
  function handleReviewWrite(event) {
    setReviewWrite(event.target.value);
  }

  // console.log('table loggg-',allinfo);
  const isSelected = name => selected.indexOf(name) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, allinfo.length - page * rowsPerPage);
  

//  console.log('urlserver',urlserver);



  // actions.getAllJob()
  // .then(res => {
  //   let {data} = res;
  //   if(!data.success) {
  //     // props.allJobs([]);
  //   } else {
  //     console.log('data4444',data)
  //     // alert('hiii1');
  //     // props.allJobs(data.jobs);
  //   }
  // })
  // .catch((err) => {
  // });
  



  // React.useEffect(() => {
  //   return () => {
  //     clearTimeout(timer.current);
  //   };
  // }, []);
  // console.log('table log-',emptyRows);
  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar numSelected={selected.length}
        selected={selected} 
        allJobs={props.allJobs}
        handleunSelect={handleunSelect}
        setCurJob={props.setCurJob}
        />
        <div className={classes.tableWrapper}>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={'medium'}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={allinfo.length}
            />
            <TableBody>
              {stableSort(allinfo, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row._id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  console.log('tbsss',row);

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row._id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onClick={event => handleClick(event, row._id)}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row" padding="none">
                        {index+1}
                      </TableCell>
                      {/* <TableCell >
                        <Avatar alt="avatar" src={row.profilePhoto ===''?default_img:row.profilePhoto} className={classes.avatar} />
                      </TableCell> */}
                      <TableCell align="center">{row.title}</TableCell>
                      <TableCell align="center">{row.category['name']}</TableCell>
                      {/* <TableCell align="center">{row.client}</TableCell> */}
                      <TableCell align="center">
                      <Button variant="contained" color={(row.nurse)?'secondary':'default'}>{row.nurse?(row.nurse.firstName + ' ' + row.nurse.lastName):'None'}</Button>
                        {/* {row.nurse?(row.nurse.firstName + ' ' + row.nurse.lastName):'None'} */}
                      </TableCell>
                      <TableCell align="center">
                      <Button variant="outlined" color={(row.status==='Pending' || row.status==='In Progress')?'primary':(row.status === 'Completed'?'secondary':'default')}>{row.status}</Button>
                    </TableCell>
                      <TableCell align="center">
                        {!row.nurse ?
                        <>
                       
                        <Link to={'/myprofile/bid-list/?d='+row._id}>
                            <IconButton aria-label="VisibilityIcon"  style={{paddingTop:0,paddingBottom:0}}>
                              <VisibilityIcon />
                            </IconButton> 
                          </Link>
                          <Link to='/myprofile/create-edit-job'onClick={()=>handleEditClick(row)}>
                            <IconButton aria-label="EditIcon"  style={{paddingTop:0,paddingBottom:0}}>
                            <EditIcon />
                            </IconButton> 
                          </Link>
                          <IconButton aria-label="DeleteIcon" onClick={()=>handleRemoveClick(row._id)} style={{paddingTop:0,paddingBottom:0}}>
                            <DeleteIcon />
                          </IconButton>
                        </>:<>
                        {
                             row.status != 'Completed'?<>
                        <IconButton aria-label="CheckIcon"  onClick={()=>handleApplyClick(row)} style={{paddingTop:0,paddingBottom:0}}>
                            <CheckIcon />
                        </IconButton> 
                          <Dialog
                            open={dialogopen}
                            onClose={handleDialogClose}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                          >
                            <DialogTitle id="alert-dialog-title">{"Finish Job"}</DialogTitle>
                            <DialogContent>
                              <DialogContentText id="alert-dialog-description">
                                Will you exactly complete this job? You can click with Complete button. 
                              </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleDialogClose} color="primary">
                                Cancel
                              </Button>
                              <Button onClick={handleAward} color="primary" autoFocus>
                                Complete
                              </Button>
                            </DialogActions>
                          </Dialog>
                          <Snackbar
                              anchorOrigin={{ vertical, horizontal }}
                              key={`${vertical},${horizontal}`}
                              open={openState}
                              onClose={handleStateClose}
                              ContentProps={{
                              'aria-describedby': 'message-id',
                              }}
                              message={<span id="message-id">{content}</span>}
                          />
                          <IconButton aria-label="MonetizationOnIcon" onClick={()=>handleDialogOpenDollar(row)}style={{paddingTop:0,paddingBottom:0}}>
                            <MonetizationOnIcon />
                           </IconButton> 
                           <Dialog
                            open={dialogopenDollar}
                            onClose={handleDialogDollarClose}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                          >
                            <DialogTitle id="alert-dialog-title">{"Charge"}</DialogTitle>
                            <DialogContent>
                              <div className="row">
                                <div className="col-12">
                                <FormGroup row>
                                              <TextField
                                        id="paymentAmount"
                                        type="number"
                                        label="Pay Amount"
                                        margin="normal"
                                        variant="outlined"
                                        value={paymentAmount}
                                        onChange={handlePaymentAmount}
                                    />
                                   
                                  </FormGroup>
                                </div>
                              </div>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleDialogDollarClose} color="primary">
                                Cancel
                              </Button>
                              <div className={classes.wrapper}>
                              <Button variant="contained"  className={buttonClassname} onClick={handleDollar} color="primary" autoFocus disabled={loading}>
                                Pay
                                {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                              </Button>
                              </div>

                            </DialogActions>
                          </Dialog>
                             </>:
                             <>
                             {row.review.indexOf("Client")!== -1 ?'Completed & Finished':<>
                             <IconButton aria-label="RateReviewIcon" onClick={()=>handleApplyReviewClick(row)}style={{paddingTop:0,paddingBottom:0}}>
                              <RateReviewIcon />
                              </IconButton>
                              <Dialog
                            open={reviewdialogopen}
                            onClose={handleReviewDialogClose}
                            fullWidth={true}
                            maxWidth={'sm'}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                          >
                            <DialogTitle id="alert-dialog-title">{"Review"}</DialogTitle>
                            <DialogContent>
                              <div className="row">
                                <div className= "col-5">
                                  <Box component="fieldset" mb={2} borderColor="transparent">
                                    <Typography component="legend">Responsiveness</Typography>
                                    <Rating 
                                      name="simple-controlled1"
                                      value={reviewvalueResponsiveness}
                                      onChange={(event1, newValue1) => {
                                        setValueResponsiveness(newValue1);
                                      }}
                                    />
                                  </Box>
                                  <Box component="fieldset" mb={2} borderColor="transparent">
                                    <Typography component="legend">Professionalism</Typography>
                                    <Rating
                                      name="simple-controlled2"
                                      value={reviewvalueProfessionalism}
                                      onChange={(event2, newValue2) => {
                                        setValueProfessionalism(newValue2);
                                      }}
                                    />
                                  </Box>
                                  <Box component="fieldset" mb={2} borderColor="transparent">
                                    <Typography component="legend">Value</Typography>
                                    <Rating
                                      name="simple-controlled3"
                                      value={reviewvalueValue}
                                      onChange={(event3, newValue3) => {
                                        setValueValue(newValue3);
                                      }}
                                    />
                                  </Box>
                                  <Box component="fieldset" mb={2} borderColor="transparent">
                                    <Typography component="legend">Flexibility</Typography>
                                    <Rating
                                      name="simple-controlled4"
                                      value={reviewvalueFlexibility}
                                      onChange={(event4, newValue4) => {
                                        setValueFlexibility(newValue4);
                                      }}
                                    />
                                  </Box>
                                  <Box component="fieldset" mb={2} borderColor="transparent">
                                    <Typography component="legend">Behaviour</Typography>
                                    <Rating
                                      name="simple-controlled5"
                                      value={reviewvalueBehaviour}
                                      onChange={(event5, newValue5) => {
                                        setValueBehaviour(newValue5);
                                      }}
                                    />
                                </Box>
                                </div>
                                <div className="col-7">
                                  <FormGroup row>
                                              <TextField
                                        id="reviewSubject"
                                        label="Review Subject"
                                        margin="normal"
                                        variant="outlined"
                                        value={reviewSubject}
                                        onChange={handleReviewSubject}
                                    />
                                    <TextField
                                      id="reviewWrite"
                                      label="Review Text"
                                      multiline
                                      rows="5"
                                      margin="normal"
                                      variant="outlined"
                                      onChange={handleReviewWrite}
                                      />
                                  </FormGroup>
                                </div>
                              </div>
                              
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleReviewDialogClose} color="primary">
                                Cancel
                              </Button>
                              <div className={classes.wrapper}>
                                <Button  variant="contained"  className={buttonClassname}color="primary" onClick={handleReview} autoFocus disabled={loading}>
                                  Send
                                </Button>
                                {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                               </div>
                                 
                              </DialogActions>
                          </Dialog>
                             </>}</>
                           }
                          
                        </>
                        }
                          
                      </TableCell> 
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={allinfo.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      {/* Delete Dialog */}
      <Dialog
        open={remove}
        onClose={handleRemoveClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Alert?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to delete this Job?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRemoveClose} color="primary">
            Disagree
          </Button>
          <Button onClick={handleRemoveSnackClick} color="primary" autoFocus className={`btn btn-primary btn-elevate kt-login__btn-primary ${clsx(
                      {
                        "kt-spinner kt-spinner--right kt-spinner--md kt-spinner--light": loading
                      }
                    )}`}>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={removesnack}
        autoHideDuration={6000}
        onClose={handleRemoveSnackClose}
      >
        <MySnackbarContentWrapper
          onClose={handleRemoveSnackClose}
          variant={"success"}
          message="Removed Successfully!"
        />
      </Snackbar>
    </div>
  );
}

export default connect(
  mapStateToProps,
  {...authDuck.actions, ...jobDuck.actions}
)(CurrentWorking)